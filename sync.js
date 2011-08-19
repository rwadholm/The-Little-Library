/* Little Library  
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

// Initialize the page
$('div#sync').live("pageshow", function() { 
	// Get text for language
	$('h1').text(libLang.syncOptions);
	$('.sendToField span.ui-btn-inner').text(libLang.send);
	$('.sendTo').text(libLang.sendTo);
	$('.or').text(libLang.or);
	$('.ui-slider-label-b').text(libLang.once);
	$('.ui-slider-label-a').text(libLang.continuously);
	$('.getFrom').text(libLang.getFrom);
	$('.getFromField span.ui-btn-inner').text(libLang.get);
	
	// Get the library URL
	$('span.libraryURL').text(homeDB);
	
	
	// On submit, set up Sync Options for sending replication
	$('.submitRepTo').click(function(event){
		
  		event.preventDefault();
		
		if ($('.syncForm input#repTo').val() == ''){
			return;	
		}
		
		var repTo = $('.syncForm input#repTo').val();
		
		// Check for continuous replication or not
		if ($('select#continuousRepTo').val() == "continuous"){
			var continuousRep = true;
		} else {
			var continuousRep = false;	
		}
		
		$.mobile.showPageLoadingMsg();
		
		
		$.ajax({
			url: "/_replicator",
			type: "POST",
			async: true,
			data: JSON.stringify({"source": homeURL, "target": repTo, "continuous":continuousRep}),
			contentType:"application/json",
			success: function(){
				alert(libLang.synced);
				window.location.replace("index.html");
			}
		});
	});
	
	
	// On submit, set up Sync Options for getting replication
	$('.submitRepFrom').click(function(event){
		
  		event.preventDefault();
		
		var repFrom = $('.syncForm input#repFrom').val();
		
		
		// Make sure the URL is filled in
		if (repFrom == ''){
			return;	
		}
		
		
		// Check for continuous replication or not
		if ($('select#continuousRepFrom').val() == "continuous"){
			var continuousRep = true;
		} else {
			var continuousRep = false;	
		}
		
		$.mobile.showPageLoadingMsg();
		
		$.ajax({
			url: "/_replicator",
			type: "POST",
			async: true,
			data: JSON.stringify({"source": repFrom, "target": "http://"+ homeUser +":"+ sessionStorage.getItem("current") +"@"+ window.location.host +"/"+ homeURL, "user_ctx": {"name": homeUser}, "continuous":continuousRep}),
			contentType:"application/json",
			success: function(){
				alert(libLang.synced);
				window.location.replace("index.html");
			}
		});
	});
	
});