<?php 
// Signup library script for The Little Library (a simple CouchDB application)
// Copyright 2011, Bob Wadholm Dual licensed MIT and GPL2
// Based on http://wiki.apache.org/couchdb/Getting_started_with_PHP Apache license version 2

header("Access-Control-Allow-Origin: *");
//error_reporting(0);

$rawUsername = $_REQUEST['username'];
$username = strtolower($rawUsername);
$password = $_REQUEST['password'];
$salt = $_REQUEST['salt'];
$onlineDB = $username;

$adminUsername = "putAdminUsernameHere"; // Change these to flat file on root possibly
$adminPassword = "putAdminPasswordHere"; // Change these to flat file on root possibly

$options['host'] = "example.com"; // Location of all onlineDB's
$options['port'] = 5984; 

$templateDB = "example/library"; // Location of the DB that will serve as a template

$couch = new CouchSimple($options); // See if we can make a connection

// If username, password and salt aren't all given, then echo back "" as onlineDB name
if($username == "" || $password == "" || $salt == ""){
	
	echo "";
	
}
else {
	
	// Get a list of all databases in CouchDb
	$resp = $couch->send("GET", "/_all_dbs");  
	$checkForDB = preg_match('/"' . $username . '"/', $resp);
	 
	// If there is already an onlineDB with their username, iterate numerically (rwadholm1, rwadholm2, etc.)
	// until their onlineDB name is unique.
	$i = 1;
	while($checkForDB >= 1) {
		$onlineDB = $username . $i;
		$checkForDB = preg_match('/"' . $onlineDB . '"/', $resp);
		
		$i++;
	}
	
	// Create a new database
	$resp = $couch->send("PUT", "/" . $onlineDB); 
	
	// Create a new user account with all credentials for the new database
	$resp = $couch->send("PUT", "/_users/org.couchdb.user%3A" . $onlineDB, '{
		"_id":"org.couchdb.user:' . $onlineDB . '",
		"name": "' . $onlineDB . '",
		"password_sha": "' . $password . '",
		"salt": "' . $salt . '",
		"onlineDB": "' . $onlineDB . '",
		"roles": ["' . $onlineDB . '"],
		"type": "user"
	}'); 
	
	/*// Make the new user the admin of their DB
	$resp = $couch->send("PUT", "/". $onlineDB ."/_security", '{"admins":{"roles":["'. $onlineDB .'"]},"readers":{"names":[],"roles":[]}}');*/
	
	// Create a new replication document
	$resp = $couch->send("POST", "/_replicate/", '{"target":"https://' . $adminUsername . ':' . $adminPassword . '@' . $options['host'] . '/' . $onlineDB . '","source":"http://' . $templateDB . '", "continuous": true}');
	
	
	// Create a JSON response that gives the new onlineDB name
	echo $onlineDB;
}	 


class CouchSimple {
	
    function CouchSimple($options) {
       foreach($options AS $key => $value) {
          $this->$key = $value;
       }
    } 
   
   function send($method, $url, $post_data = NULL) {
	   
		$adminUsername = "putAdminUsernameHere"; // Same as line 15 above
		$adminPassword = "putAdminPasswordHere"; // Same as line 16 above

		
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