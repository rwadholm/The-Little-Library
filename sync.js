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
	$('#syncInstructions').html(libLang.syncInstructions);
	
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
		
		secureHome = "http://"+ homeUser +":"+ sessionStorage.getItem('current') +"@"+ window.location.host +"/"+ homeURL;
		
		$.ajax({
			url: "/_replicate",
			type: "POST",
			data: JSON.stringify({"source": secureHome, "target": repTo, "filter": "library/no_design", "continuous":continuousRep}),
			contentType:"application/json",
			error: function(){
				alert(libLang.noSyncOnline); 
				$.mobile.hidePageLoadingMsg();
			},
			success: function(message){
				if(message){
					alert(libLang.synced);
					$.mobile.hidePageLoadingMsg();
				};
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
		
		secureHome = "http://"+ homeUser +":"+ sessionStorage.getItem('current') +"@"+ window.location.host +"/"+ homeURL;
		
		$.ajax({
			url: "/_replicate",
			type: "POST",
			data: JSON.stringify({"source": repFrom, "target": secureHome, "userCtx": {"name": homeUser, "roles":["_admin", homeUser]}, "continuous":continuousRep}),
			contentType:"application/json",
			error: function(){
				alert(libLang.noSyncOnline); 
				$.mobile.hidePageLoadingMsg();
			},
			success: function(message){
				if(message){
					alert(libLang.synced);
					$.mobile.hidePageLoadingMsg();
				};
			}
		});
	});
});