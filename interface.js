/* Little Library  
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

// Initialize the page
$('div#interface').live("pageshow", function() { 
	// Get text for language
	$('h1').text(libLang.interface);
	$('.language').text(libLang.language);
	$('.changeLang').text(libLang.changeLanguage);
	$('.changeLangText').text(libLang.changeLanguageText);
	$('.langInstructions').text(libLang.languageInstructions);
	$('.languageForm .SubmitBtn span.ui-btn-inner').text(libLang.submitBtn);
	
	
	// Fill dropdown with language options
	$.ajax({
		url: '/'+ homeURL +'/_design/library/_view/languages?callback=',
		dataType: 'json',
		success: function(languagesData){
			$('select#language option').remove();
			$.each(languagesData.rows, function(cat, rowsHere){
				if (rowsHere.key.current == true){
					
					currentID = (rowsHere.id).split('-');
					
					// Create options dropdown for current item
					$('select#language').append('<option value="'+ rowsHere.id +'" selected="selected">'+ currentID[0] +' ('+ currentID[1] +')</option>');
					$('.ui-select span.ui-btn-text').text(currentID[0] +' ('+ currentID[1] +')');
					
					// Create editing form
					$('h3.changeLangText').append(' - <span style="color:#254F7A">'+ rowsHere.key.name +'</span>');
					$('.ui-content').append('<form class="uiForm" method="PUT" enctype="multipart/form-data"><div id="editUI"></div><div data-theme="b" class="ui-btn ui-btn-corner-all ui-shadow ui-btn-inline ui-btn-down-b ui-btn-up-b" aria-disabled="false"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">'+  libLang.submitBtn +'</span></span><input type="submit" id="submitEdit" data-inline="true" data-theme="b" class="submitEdit ui-btn-hidden" value="'+ libLang.submitBtn +'" aria-disabled="false" /></div></form>');
					
					$.each(rowsHere.key, function(topVariable, topValue){
						
						// Add editable UI fields to the form
						if(topVariable == "texts"){
							$.each(rowsHere.key.texts, function(variable, value){
								// Don't make EULA editable
								if(variable != "terms" && variable != "_conflicts" && variable != "_deleted_conflicts" && variable != "_revs_info" && variable != "_attachments"){
									// Add fields in textboxes for editing
									$('#editUI').append('<div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><!--<label for="'+ variable +'" class="'+ variable +'Label ui-input-text">'+ variable +'</label>--><textarea name="'+ variable +'" id="'+ variable +'" class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c">'+ value +'</textarea></div>');
								}
							});
						}
						else if (topVariable == "name"){
							// Make the name of the language file editable
							$('#editUI').append('<div data-role="fieldcontain" class="ui-field-contain ui-body ui-br"><label for="'+ topVariable +'" class="'+ topVariable +'Label ui-input-text"><strong>'+ libLang.titleLabel +'</strong></label><br /><input type="text" value="'+ topValue +'" name="'+ topVariable +'" id="'+ topVariable +'" class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c" /></div><br /><br />');
						}
						else {
							// Add some hidden fields to the form like _id, _rev, type, & current
							$('#editUI').append('<input type="hidden" value="'+ topValue +'" name="'+ topVariable +'" id="'+ topVariable +'" class="ui-input-text ui-body-null ui-corner-all ui-shadow-inset ui-body-c">');
						}
					});
				}
				else {
				// If not the current language, just add drop down option
				
					currentID = (rowsHere.id).split('-');
					$('select#language').append('<option value="'+ rowsHere.id +'">'+ currentID[0] +' ('+ currentID[1] +')</option>');
				}
				
			});	
				
		}
	});
	
	
	$('form.uiForm input#submitEdit').live('click', function(event){
		
  		event.preventDefault();
		
		$.mobile.showPageLoadingMsg();
		
		langTitle = $('input#name').val();
		langRev = $('input#_rev').val();
		langID = $('input#_id').val();
		langCurrent = $('input#current').val();
		langType = $('input#type').val();
		rawLangName = $('input#name').val();
		itemID = langID;
			
		// Array that will hold the language text fields for saving later
		var textData = {};

		$.each($("form.uiForm :input").serializeArray(), function(i, field) {
			
			if(field.name != "_rev" && field.name != "_id" && field.name != "current" && field.name != "type" && field.name != "name" && field.name != "" && field.name != "_conflicts" && field.name != "_deleted_conflicts" && field.name != "_revs_info" && field.name != "_attachments"){
				textData[field.name] = field.value;
			}
		});
		
		
		// Change current language text and set "current":false on old language file
		$.ajax({
			url: '/'+ homeURL +'/'+ langID,
			dataType: 'json',
			async: false,
			success: function(langData){
				langData.current = false;
				$.ajax({
					url: '/'+ homeURL +'/'+ langID,
					contentType: "application/json",
					dataType: "json", 
					type: "PUT",
					async: false,
					data: JSON.stringify(langData),
					success: function(langDataNew){
						
						langIDCheck = langID.split('-');
						
						// If the language file name or the user is new, create a new file
						if(langIDCheck[1] != homeUser || langIDCheck[0] != rawLangName){
						
							uniqueID = $.couch.newUUID();
							itemID = langTitle.replace(/[\s]/g,'_');
							itemID = itemID +'-'+ homeUser +'-'+ uniqueID; 
							itemID = itemID.replace(/[^a-z 0-9 _ -]+/gi,'');
							
							// Create new language file
							$.ajax({
								url: '/'+ homeURL +'/'+ itemID,
								contentType: "application/json",
								dataType: "json", 
								type: "PUT",
								async: false,
								data: JSON.stringify({
									"_id":itemID, 
									"current": true,
									"type": langType,
									"name": rawLangName,
									"texts": textData
								}),
								success: function(savedNow){
									if(savedNow){
										alert(libLang.saved);
										window.location.replace("interface.html");
									};
								},
								error: function(){
									alert(libLang.errorSettings);	
								}
							});
						}
						else {
							// Update old language file
							$.ajax({
								url: '/'+ homeURL +'/'+ langDataNew.id,
								contentType: "application/json",
								dataType: "json", 
								type: "PUT",
								async: false,
								data: JSON.stringify({
									"_id":langDataNew.id, 
									"_rev": langDataNew.rev,
									"current": true,
									"type": langType,
									"name": rawLangName,
									"texts": textData
								}),
								success: function(savedNow){
									if(savedNow){
										alert(libLang.saved);
										window.location.replace("interface.html");
									};
								},
								error: function(){
									alert(liblang.errorSettings);	
								}
							});
						}
					}
				});
			}
		});
	});
	
	
	// On submit, change current language
	$('.Submit').click(function(event){
		
  		event.preventDefault();
		
		$.mobile.showPageLoadingMsg();
		
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
											success: function(savedNow){
												if(savedNow){
													window.location.replace("interface.html");
												};
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