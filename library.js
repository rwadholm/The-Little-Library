/* The Little Library  
Copyright 2011 Bob Wadholm, Dual GPL and MIT Licenses */

var currentHost = window.location.protocol + "//" + window.location.host; // variable for the database domain
var dbURL = document.URL.split("//"); 
dbURL = (dbURL[1] ? dbURL[1] : dbURL[0]).split("/"); 
var homeURL = dbURL[1]; // variable for the database name
var homeDB = currentHost +"/"+ homeURL; // variable for the database full url
var repOptions = {"continuous":true};
var templateDB = "http://library.iriscouch.com/library"; // URL to the template for The Little Library
var signupURL = "http://www.thelittlelibrary.com/library.php"; // URL to PHP signup script
var onlineBase = "library.iriscouch.com"; // URL of online database hosting all onlineDBs
var maxDBSize = 250000000; // Default max DB size is 250MB
var homeUser = '';

// Get username
$.ajax({
	url: '/_session?callback=',
	dataType: 'json',
	async: false,
	success: function(session){
		homeUser = session.userCtx.name;
	}
});

// Translate UI to language of choice
var libLang = {};
$.ajax({
	url: '/'+ homeURL +'/_design/library/_view/currentLang?callback=',
	dataType: 'json',
	async: false,
	success: function(langJSON){
		if(langJSON.total_rows == '0'){
			$.ajax({
				url: '/'+ homeURL +'/_design/library/language.json',
				dataType:'json',
				async: false,
				success: function(langData){
					libLang = langData.texts;
				}
			});
		}
		else {
			$.ajax({
				url: '/'+ homeURL +'/'+ langJSON.rows[0].id,
				dataType: 'json',
				async: false,
				success: function(langData){
					libLang = langData.texts;
				}
			}); 
		}
	}
});


// Ensure authentication
jQuery.fn.libraryAuth = function(){
	
	// If logged in already, display username at the end of the list
	if(homeUser != undefined || null) {
		
		if (onlineBase == window.location.host && homeUser != homeURL){
			window.location.replace("login.html");
		}
		
		$('.ui-footer h4').prepend(homeUser +'<br />');
		
	
	// If not logged in, go to login/signup page
	} else { 
		window.location.replace("login.html");
	};
};



// Set up onlineDB and sync with it
jQuery.fn.createOnlineDB = function(username, password){
	couchUser = "org.couchdb.user%3A"+ username;
	couchUserUn = "org.couchdb.user:"+ username;
	
	// Setup onlineDB and set up username and password, and get the onlineDB name as response
	$.getJSON(currentHost +'/_users/'+ couchUser, function(userInfo){
		passwordEnc = userInfo.password_sha;
		saltEnc = userInfo.salt;
		
		$.ajax({
			url: signupURL,
			type: "POST",
			data: {"username":username, "password":passwordEnc, "salt":saltEnc},
			error: function(){
				alert(libLang.noOnline); // Get text for langauge
				window.location.replace("index.html");
			},
			success: function(onlineDB){
				
				// If setting up onlineDB was successful
				if (onlineDB){
					
					currentRev = userInfo._rev;
					
					// Put onlineDB name into user file on local library
					$.couch.db("_users").saveDoc({
						"_id": couchUserUn,
						"_rev":currentRev, 
						"name":username,
						"onlineDB":onlineDB, 
						"password_sha":passwordEnc,
						"salt":saltEnc,
						"type":"user",
						"roles":[username]
					}, {
						success: function(resp) { 
						
							if(resp){
								window.location.replace('login.html'); 
							};
						}
					});
				}
				else {
					alert(libLang.noOnline);
					window.location.replace("index.html");	
				};
			}
		});
		
	});
};


// Sign up for new library, turn on replication, and login
jQuery.fn.signupForm = function(username, password){
	
	$.couch.signup({"name": username,"onlineDB":"",roles:[username]}, password, {
		success: function(){ 
			
			$.couch.login({"name": username,"password": password});
			
			$.mobile.showPageLoadingMsg();
			
			$('div').createOnlineDB(username, password);
			
		}
	});
};



// Show number of items in each category on home page
jQuery.fn.numShow = function(numlist) {
	// Get number of items from JSON
	$.getJSON('/'+ homeURL +'/_design/library/_view/'+ numlist +'?callback=', function(json) {
		$('.'+ numlist +'Total').addClass('ui-li-count ui-btn-up-c ui-btn-corner-all').html(json.total_rows);
		
	});
	
};


// Home page categories list
jQuery.fn.categoryShow = function() {
	
	// Get JSON file
	$.getJSON('/'+ homeURL +'/_design/library/?callback=', function(data) {
		
		// List each item in the library category
		$.each(data.views, function(singleView){
			translatedSingleView = singleView;
			if(singleView == "books"){
				translatedSingleView = libLang.books;
			}
			if(singleView == "audio"){
				translatedSingleView = libLang.audio;
			}
			if(singleView == "videos"){
				translatedSingleView = libLang.videos;
			}
			if(singleView == "pictures"){
				translatedSingleView = libLang.pictures;
			}
			if(singleView == "documents"){
				translatedSingleView = libLang.documents;
			}
			if(singleView == "notes"){
				translatedSingleView = libLang.notes;
			}
			if(singleView == "courses"){
				translatedSingleView = libLang.courses;
			}
			// Don't list the languages views
			if (singleView != "languages" && singleView != "currentLang") {
				$('ul.homeList').append('<li class="ui-li-has-count"><a href="library.html?type='+ singleView +'" rel="external" data-transition="slide">'+ translatedSingleView +'<span class="'+ singleView +'Total"></span></a></li>');
				$('.'+ singleView +'Total').numShow(singleView);
				
				$('#home ul.homeList').listview('refresh');
			}
		});
						
	});
	
};


// Category page list of items
jQuery.fn.listShow = function(category, libURL, local) {
	var categoryName = category;
	
	$('h1').text(libLang[category]);
	
	
	// Get JSON file
	/*$.getJSON(libURL +'/_design/library/_view/'+ categoryName +'?callback=', function(categoryData) {*/
	if(local == false){
		jsonUsed = "jsonp";
	} 
	else {
		jsonUsed = "json";
	}
	
	$.ajax({
		type: 'GET',
		url: libURL +'/_design/library/_view/'+ categoryName,
		processData: true,
		dataType: jsonUsed,
		error: function(){
			alert('What happened?');
		},
		success: function(categoryData){
			if (categoryData.rows == '') {
			
				$('ul.'+ categoryName +'List').append('');
			}
			else {
				// List each item in the library category
				$.each(categoryData.rows, function(cat, singleItem){
					
					var itemDate = '',
						fileURL = '';
					
					// Get the file extension of the current attachment
					function getFileExtension(newFiles) {
						return newFiles.split('.').pop();
					};
					
					
					if (singleItem.key.date != ''){
						itemDate = ('('+ singleItem.key.date +')');
					}
					
					settingsURL = libURL +'/_design/library/settings.html?id='+ singleItem.key._id +'&amp;type='+ singleItem.key.type;
					
					// Get the first filename by iterating over attachments
					for	(var filename in singleItem.key._attachments){
						// Automatically make index.html the home page if it exists
						if (filename == "default.htm" || filename == "default.html" || filename == "index.htm" || filename == "index.html"){
							if (!local || local == false){
								fileURL = libURL +'/'+ singleItem.key._id +'/'+ filename;
							}
							else {
								fileURL = 'wrapper.html?name='+ singleItem.key.title +'&amp;url='+ libURL +'/'+ singleItem.key._id +'&amp;path='+ filename;
							}
							break;
						}
					};
					
					// If there is no index page, make a link to the last attachment if it exists
					if (!fileURL || fileURL == '' || fileURL == null || fileURL == 'undefined'){
						for	(var filename in singleItem.key._attachments){
							fileURL = libURL +'/'+ singleItem.key._id +'/'+ filename;
							break;
						}
						
						if (local && local == true){
							// If there are no attachments, open the settings page
							if (!filename || filename == '' || filename == null || filename == 'undefined'){
								//fileURL = settingsURL;
								fileURL = "_show/details/"+ singleItem.key._id;
							}
						}
						else{
							libLang.settings = libLang.get;	
						}
					}
					
					
					// Create a thumbnail for items that have images
					itemThumb = '';
					// File formats to expect for thumbnails
					imageArray = {'jpg':'jpg','gif':'gif','png':'png','jpeg':'jpeg','JPG':'JPG','GIF':'GIF','PNG':'PNG','JPEG':'JPEG','BMP':'BMP'}; 
					
					// Iterate through the attachments and create a thumbnail of the last image
					for(var filename in singleItem.key._attachments){ 
						newFile = getFileExtension(filename); 
						
						if(imageArray[newFile]){
							itemThumb = '<img src="'+ libURL +'/'+ singleItem.key._id +'/'+ filename +'" />';
							break;
						}
					};
					
					// Create the html for each item in the category
					$('ul.listedItems').append('<li><a href="'+ fileURL +'" class="itemURL" rel="external">'+ itemThumb +'<h3 class="itemTitle">'+ (singleItem.key.title).replace(/(<([^>]+)>)/ig,"") +'</h3><p class="itemDetails"><strong>'+ (singleItem.key.author).replace(/(<([^>]+)>)/ig,"") +'</strong> '+ (itemDate).replace(/(<([^>]+)>)/ig,"") +'<br />'+ (singleItem.key.description).replace(/(<([^>]+)>)/ig,"") +'</p></a><a href="'+ settingsURL +'" rel="external" class="used'+ jsonUsed +'" data-library-url="'+ singleItem.key._id +'">'+ libLang.settings +'</a></li>');
									
					$('ul.listedItems').listview('refresh');
					
				});
			};
		}
	});
};


// Find the cat (category) parameter in the URL when changing settings on an item
// This function is adapted from: http://www.bloggingdeveloper.com/post/JavaScript-QueryString-ParseGet-QueryString-with-Client-Side-JavaScript.aspx
jQuery.fn.getParameter = function(key, default_){
	
	if (default_==null) default_="add"; 
	
	key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	
	var regex = new RegExp("[\\?&]"+key+"=([^&#]*)");
	var qs = regex.exec(window.location.href);
	
	if(qs == null)
		return default_;
	else
		return qs[1];
}


// Category page list of items
jQuery.fn.formShow = function(itemID) {
	
	var itemName = itemID;
			
	// Get JSON file and fill in form with data
	$.getJSON('/'+ homeURL +'/' + itemName +'?callback=', function(itemData) {
		if (itemData.rows == '') {
		
			$('.settingsForm').fadeOut(function(){
				$(this).html('<p>'+ libLang.errorSettings +'</p>').fadeIn(500); // Get text for langauge
			});
		}
		else {
			// Fill out the form with current data for the item
			
			if (itemData.user){
				$('.settingsForm').prepend('<p style="color: #777777"><em>'+ libLang.fromTheLibrary +' <strong>'+ itemData.user +'</strong></em></p>');
			};
			
			$('#settings h1').text(itemData.title);
			$('.settingsForm input#title').val(itemData.title);
			$('.settingsForm input#author').val(itemData.author);
			$('.settingsForm textarea#description').val(itemData.description);
			$('.settingsForm input#date').val(itemData.date);
			$('.settingsForm input#_rev').val(itemData._rev);
			$('.settingsForm input#type').val(itemData.type);
			$('.settingsForm input#filename').val(itemData.filename);
			$('form.settingsForm').attr({"action": "/"+ homeURL + "/"+ itemData._id});
			
			if (!itemData.filename || !itemData._attachments || itemData._attachments.length <= 0) {
				return false;
			}
			else {
				// Show all attached files
				$('.settingsForm #_attachments').after('<div class="filesList" style="margin: 20px 0px; border: 1px solid #ccc; padding: 0px 20px; border-radius: 10px; background: #fff;"><h3>'+ libLang.currentFilesLabel +'</h3></div>');
				// Get filenames by iterating over attachments
				for	(var filename in itemData._attachments){
					
					fileSizes = itemData._attachments[filename].length - 1;
					newSize = Math.round(fileSizes / 1000);
					if (newSize <= 999){
						newSize = newSize +'KB';
					}
					else if (newSize <= 9999999){
						newSize = newSize +'MB';
					}
					else if (newSize <= 999999999){
						newSize = newSize +'GB';
					}
					/* mimeType = itemData._attachments[filename].content_type */
					
					fileURL = '/'+ homeURL +'/'+ itemData._id +'/'+ filename;
					$('.settingsForm .filesList').append('<p style="position:relative; border-top: 1px solid #ccc; padding-top: 10px;"><span data-inline="true"><strong><a href="'+ fileURL +'" rel="external">'+ filename +'</a></strong><span style="color: #999">, '+ newSize +'</span></span> <a title="'+ libLang.deleteLabel +' '+ filename +'" style="position:absolute; top: 2px; right: 0px; display: block;" rel="'+ filename +'" data-role="button" data-icon="delete" title="Delete" data-iconpos="notext" class="deleteThisFile ui-btn ui-btn-icon-notext ui-btn-corner-all ui-shadow ui-btn-down-c ui-btn-up-c"><span class="ui-btn-inner ui-btn-corner-all" aria-hidden="true"><span class="ui-btn-text">'+ libLang.deleteLabel +'</span><span class="ui-icon ui-icon-delete ui-icon-shadow"></span></span></a></p>');
				};
			}
		};
	});
};



jQuery.fn.sendForm = function(itemID, itemType) {
	
	// Get all of the values from the form fields
	var itemTitle = $('.settingsForm input#title').val(),
		itemAuthor = $('.settingsForm input#author').val(),
		itemDescription = $('.settingsForm textarea#description').val(),
		itemDate = $('.settingsForm input#date').val(),
		itemRev = $('.settingsForm input#_rev').val(),
		itemDelete = $('.settingsForm input#delete:checked').val(),
		itemType = $('.settingsForm select').val(),
		itemFilename = $('.settingsForm input:file').val(); 
	
	// Check for new uploaded file
	if (itemFilename == undefined || itemFilename == ""){
		$('.settingsForm input:file').remove();
		itemFilename = "";
	}
	else {
		itemFilename = itemFilename.replace(/^C:\\fakepath\\/i, '');
	}
	
	
	 // If no new file, then fall back on the old filename
	if (!itemFilename || itemFilename.length == 0) {
		itemFilename = $('.settingsForm input#filename').val();
	}
	
	// Force to add a title (the only required field)
	if (!itemTitle || itemTitle.length == 0) {
		alert(libLang.addTitle); // Get text for language
		return;
	}
	
	// Check if size of db is above the limit
	dbSize = maxDBSize;
	$.ajax({
		url: "/"+ homeURL,
		dataType: 'json',
		async: false,
		success: function(dbInfo){
			dbSize = dbInfo.data_size;
		}
	});
	if (itemDelete != 'Yes' && dbSize >= maxDBSize){
		alert(libLang.noSpace);
		return;
	}
	
	
	
	/*
	// Requires an uploaded file
	if (!revData._attachments || revData._attachments.length == 0) {
		alert("Please select a file to upload.");
		return;
	}*/
	
	
	
	
	if (itemDelete != 'Yes'){
	
		if (itemID != 'add'){
			
			// Update existing record
			$(this).ajaxSubmit({
				url: "/"+ homeURL +"/"+ itemID,
				data: {"filename":itemFilename},
				success: function(resp) {
				
					$.getJSON("/"+ homeURL +"/"+ itemID, function(revData) {
						itemRev = revData._rev;
						itemAttachment = revData._attachments;
						user = revData.user;
						
						if (!revData._attachments || revData._attachments.length == 0) {
							
							$.couch.db(homeURL).saveDoc({
								"_id": itemID,
								"_rev": itemRev,
								"filename":itemFilename,
								"title":itemTitle,
								"author":itemAuthor,
								"type":itemType,
								"description":itemDescription,
								"date":itemDate,
								"user":user
							}, {
								success: function() { 
									alert(libLang.saved); // Get text for language
									window.location.replace("index.html");
								}
							});
						}
						else {
							$.couch.db(homeURL).saveDoc({
								"_id": itemID,
								"_rev": itemRev,
								"filename":itemFilename,
								"title":itemTitle,
								"author":itemAuthor,
								"type":itemType,
								"description":itemDescription,
								"date":itemDate,
								"user":user,
								"_attachments":itemAttachment
							}, {
								success: function() { 
									alert(libLang.saved); // Get text for language
									window.location.replace("index.html");
								}
							});
						};
					});
				}
			});
		} 
		else {
			
			
			// Add new record
			uniqueID = $.couch.newUUID();
			itemID = itemTitle.replace(/[\s]/g,'_');
			itemID = homeUser +'-'+ itemType.charAt(0).toUpperCase() + itemType.slice(1) +'-'+  encodeURI(itemID) +'-'+ uniqueID;
			itemID = itemID.replace(/[^a-z 0-9 _ -]+/gi,'');
			
			
			$('form .settingsForm').attr({"action":"/"+ homeURL +"/"+ itemID});
			
			// Save information
			$.couch.db(homeURL).saveDoc({
				"_id": itemID,
				"filename":itemFilename,
				"title":itemTitle,
				"author":itemAuthor,
				"type":itemType,
				"description":itemDescription,
				"date":itemDate,
				"user":homeUser
			}, {
				success: function(){
					
					// Get saved info, then add attachment to item
					$.getJSON("/"+ homeURL +"/"+ itemID, function(revData) {
						
						$('.settingsForm input#_rev').val(revData._rev);
						
						var data = {};

						$.each($("form :input").serializeArray(), function(i, field) {
							data[field.name] = field.value;
						});
						
						$("form :file").each(function() {
							data[this.name] = this.value.replace(/^C:\\fakepath\\/g, ''); // file inputs need special handling
						});
						
						itemFilename = data._attachments;
							
						
						$('form.settingsForm').ajaxSubmit({
							url: "/"+ homeURL +"/"+ itemID,
							success: function(resp) {
								$.getJSON("/"+ homeURL +"/"+ itemID, function(saveData) {
									itemRev = saveData._rev;
									itemAttachment = saveData._attachments;
									
									// Resave all information
									$.couch.db(homeURL).saveDoc({
										"_id": itemID,
										"_rev": itemRev,
										"filename":itemFilename,
										"title":itemTitle,
										"author":itemAuthor,
										"type":itemType,
										"description":itemDescription,
										"date":itemDate,
										"user":homeUser,
										"_attachments":itemAttachment
									}, {
										success: function() { 
											alert(libLang.saved); // Get text for language
											window.location.replace("index.html");
										}
									});
								});
							}
						});
					});
				}
			});			
		}; 			
	} else {
		// Delete the item from the library
		$.couch.db(homeURL).removeDoc({'_id': itemID, "_rev": itemRev});
		window.location.replace("index.html");
	}	
};

// Initialize library authentication
$('div').live("pageshow", function() {  
			
	// Make sure user is logged in if they are not already on the login page
	if($('h1').attr('data-login') != "login"){
		$('div').libraryAuth();
	};
	
	$.getJSON(currentHost +'/_session', function(sessionInfo){
		
			
		/* 
		
		i = 0;	
		while (i < sessionInfo.userCtx.roles.length){
			if (sessionInfo.userCtx.roles[i] == sessionInfo.userCtx.name){
				alert("Yay!");
			}
			else{
				alert("not good!");
			};
			i++;
		};
		*/
	});
	
	$('.ui-footer').after('<a href="http://creativecommons.org/licenses/by-sa/3.0/" style="display: block;position: relative; top: 10px; text-align: center;"><img src="by-sa.png" alt="Creative Commons License" /></a>');
	
	// Get text for language
	//document.title = libLang.title;
	$('a.backBtn span.ui-btn-text').text(libLang.backBtn);
	$('h1.ui-title').text(libLang.title);
	$('a.homeBtn').attr({'title': libLang.homeBtn});
	$('a.homeBtn span.ui-btn-text').text(libLang.homeBtn);
	$('a.optionsBtn').attr({'title': libLang.optionsBtn});
	$('a.optionsBtn span.ui-btn-text').text(libLang.optionsBtn);
});