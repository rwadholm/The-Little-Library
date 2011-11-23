/* Little Library  
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */


// Initialize the page
$('div#settings').live("pageshow", function() { 

	// Get text for language
	$('.deleteLabel span.ui-btn-text').text(libLang.deleteLabel);
	$('.titleLabel').text(libLang.titleLabel);
	$('.authorLabel').text(libLang.authorLabel);
	$('.descriptionLabel').text(libLang.descriptionLabel);
	$('.dateLabel').text(libLang.dateLabel);
	$('.fileLabel').text(libLang.fileLabel);
	$('.finalField .ui-btn-text').text(libLang.submitBtn);
	$('.Submit').val(libLang.submitBtn);
	$('h1').text(libLang.add);
	
	// Get the document id and type (i.e. book, video, etc.) from the URL
	var itemID = $('#settings').getParameter('id');	
	var itemType = $('#settings').getParameter('type');
	
	// Set the title of the page
	$('h1').text(libLang.add +' '+ libLang[itemType]);
	
	// If user has clicked on add button, don't look for any JSON files to fill in form and remove delete button
	$('.deleteButton').fadeOut();
	
	if (itemType == 'notes'){
		
		$('.settingsForm .descriptionLabel').text(libLang[itemType]);
		$('.settingsForm #description').attr('style','height: 250px;');
	}
	
	// Fill out the form with data if it exists
	if (itemID != 'add'){
		$('.deleteButton').fadeIn();
		$('.settingsForm').formShow(itemID);
	};
	
	
	/*// Show progress of uploads
	$('input[type="file"]').change(function(){
		$(this).after('<progress max="100" value="50">50</progress>');
	});*/
	
	// When user clicks on the form submit button, information is saved to the database
	$('input.Submit').click(function(event){
		
  		event.preventDefault();
		
		$('.settingsForm').sendForm(itemID, itemType);
	
	});
	
	// Allow users to delete single file attachments to the item
	$('a.deleteThisFile').live('click', function(event){
		
		event.preventDefault();
		
		fileURL = $(this).attr('rel');
		
		$(this).parent().fadeOut();
		
		$.getJSON("/"+ homeURL +"/"+ itemID, function(revData) {
			itemRev = revData._rev;
			$.ajax({
				url: '/'+ homeURL +'/'+ itemID +'/'+ fileURL +'?rev='+ itemRev,
				dataType: 'json',
				type: 'DELETE'
			});
		});
	});
});