/* Little Library  
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

// Initialize the page
$('div#interface').live("pageshow", function() { 
	// Get text for language
	$('h1').text(libLang.interface);
	$('.language').text(libLang.language);
	$('.languageForm .SubmitBtn span.ui-btn-inner').text(libLang.submitBtn);
	
	
	// Fill dropdown with language options
	$.ajax({
		url: '/'+ homeURL +'/_design/library/_view/languages?callback=',
		dataType: 'json',
		success: function(languagesData){
			$('select#language option').remove();
			$.each(languagesData.rows, function(cat, rowsHere){
				if (rowsHere.key.current == true){
					$('select#language').append('<option value="'+ rowsHere.id +'" selected="selected">'+ rowsHere.key.name +'</option>');
					$('.ui-select span.ui-btn-text').text(rowsHere.key.name);
				}
				else {
					$('select#language').append('<option value="'+ rowsHere.id +'">'+ rowsHere.key.name +'</option>');
				}
				
			});	
				
		}
	});
	
	
	// On submit, set up Sync Options for sending replication
	$('.Submit').click(function(event){
		
  		event.preventDefault();
		
		itemID = $('select option:selected').val();
		
		$.ajax({
			url: '/'+ homeURL +'/_design/library/_view/currentLang?callback=',
			dataType: 'json',
			async: false,
			success: function(langJSON){
				$.ajax({
					url: '/'+ homeURL +'/'+ langJSON.rows[0].id,
					dataType: 'json',
					async: false,
					success: function(langData){
						langData.current = false;
						
						$.ajax({
							url: '/'+ homeURL +'/'+ langJSON.rows[0].id,
							contentType: "application/json",
            				dataType: "json", 
							type: "PUT",
							async: false,
							data: JSON.stringify(langData),
							success: function(){
								
								$.ajax({
									url: '/'+ homeURL +'/'+ itemID,
									dataType: 'json',
									async: false,
									success: function(langDataNew){
										langDataNew.current = true;
										
										$.ajax({
											url: '/'+ homeURL +'/'+ itemID,
											contentType: "application/json",
											dataType: "json", 
											type: "PUT",
											async: false,
											data: JSON.stringify(langDataNew),
											success: function(){
												
												window.location.replace("interface.html");
													
											}
										});
									}
								});
							}
						});
					}
				});
			}
		});
	});
});