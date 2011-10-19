<?php 
// Signup library script for The Little Library (a simple CouchDB application)
// Copyright 2011, Bob Wadholm Dual licensed MIT and GPL2
// Based on http://wiki.apache.org/couchdb/Getting_started_with_PHP Apache license version 2

header("Access-Control-Allow-Origin: *");

header("Cache-Control: no-cache, must-revalidate");
error_reporting(0);

$rawUsername = $_REQUEST['username'];
$username = strtolower($rawUsername);
$password = $_REQUEST['password'];
$salt = $_REQUEST['salt'];
$onlineDB = $username;

$adminUsername = "adminUsername"; // Change these to flat file on root possibly
$adminPassword = "adminPassword"; // Change these to flat file on root possibly

$options['host'] = "example.com"; // Location of all onlineDB's
$options['port'] = 5984; 

$templateDB = "library";

$couch = new CouchSimple($options); // See if we can make a connection

// If username, password and salt aren't all given, then echo back "" as onlineDB name
if($username != $adminUsername || $password != $adminPassword){
	
	echo "<p>Must include username and password</p>";
	
}
else {
	/*
	// Replicates template to all DB's
	$resp = $couch->send("POST", "/_replicate", '{
		"_design/library":[
			"30-b4cb01005961645cd98322e499befb8a"
		]
	}'); */
	
	// Get a list of all databases online, and replicate with each
	$resp = $couch->send("GET", "/_all_dbs");
	
	$ignoreUsers = preg_replace('/\"_users\",/','', $resp);
	$ignoreReplicator = preg_replace('/\"_replicator\",/','', $ignoreUsers);
	$ignoreLibrary = preg_replace('/\"' . $templateDB . '\",/','', $ignoreReplicator);	
	$ignoreQuotations = preg_replace('/\"/','', $ignoreLibrary);	
	$ignoreLeftBracket = preg_replace('/\[/','', $ignoreQuotations);
	$ignoreBreaks = preg_replace('/\\n/','', $ignoreLeftBracket);
	$ignoreRightBracket = preg_replace('/\]/','', $ignoreBreaks);
	$DBArray = explode(',', $ignoreRightBracket);
	
	
	$totalDBs = count($DBArray);
	
	
	$repArray = array();
	$compactArray = array();
	
	$i = 1;
	while($i <= $totalDBs) {
		$currentNum = $i;
		$currentDB = $DBArray[$currentNum - 1];
		
		// Replicate with the templateDB
		$repArray[$currentDB] = $couch->send("POST", "/_replicate", '{"_id": "' . $currentDB . '","target":"' . $currentDB . '","source": "' . $templateDB . '", "user_ctx":{"name":"' . $adminUsername . '","roles":["_admin"]}}');
		
		//var_export($repArray[$currentDB], true);
		
		$compactArray[$currentDB] = $couch->send("POST", "/". $currentDB ."/_compact");
		
		//var_export($compactArray[$currentDB], true);
		
		echo '<p>'. $currentDB .', '. $repArray[$currentDB] .', '. $compactArray[$currentDB] .'</p>';
		
		$i++;
	}
	
	var_export($resp, true);
	
	// Create a JSON response that gives the new onlineDB name
	echo "<p>All databases were successfully updated and compacted.</p>";
 
}

class CouchSimple {
	
    function CouchSimple($options) {
       foreach($options AS $key => $value) {
          $this->$key = $value;
       }
    } 
   
   function send($method, $url, $post_data = NULL) {
	   
		$adminUsername = "adminUsername"; // Change these to flat file on root possibly
		$adminPassword = "adminPassword"; // Change these to flat file on root possibly

		
      $s = fsockopen($this->host, $this->port, $errno, $errstr); 
      if(!$s) {
         echo "$errno: $errstr\n"; 
         return false;
      } 

      $request = "$method $url HTTP/1.0\r\nHost: $this->host\r\n";
      
         $request .= "Authorization: Basic ".base64_encode("$adminUsername:$adminPassword")."\r\n";
		 $request .= "Content-Type: application/json\r\n"; 
      

      if($post_data) {
         $request .= "Content-Length: ".strlen($post_data)."\r\n\r\n";
         $request .= "$post_data\r\n";
      } 
      else {
         $request .= "\r\n";
      }

      fwrite($s, $request); 
      $response = ""; 

      while(!feof($s)) {
         $response .= fgets($s);
      }

      list($this->headers, $this->body) = explode("\r\n\r\n", $response); 
      return $this->body;
   }
}

?>