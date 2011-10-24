# The Little Library

### Description & Easy Installation

The Little Library is an open source application that allows you to upload, store, and share creative commons licensed content across computers and digital devices, offline and in the cloud. The Little Library was built as a peer-to-peer sharing distributed platform for storing/sharing Open Licensed content (videos, audio, books, notes, courses, and pictures) for use in educational settings around the world, where offline learning libraries, and automated peer-to-peer replication of content will hopefully help to make constructivist forms of learning more widespread. 

The Little Library is built on CouchDB, JQuery, and JQuery Mobile, along with a small PHP proxy, and uses Ryan Ramage's CouchApp Takeout (https://github.com/ryanramage/couchapp-takeout) for installation. 

To try it out, just go to: http://littlelibrary.tk

### More Complex Installation

If you don't like easy installations and you'd rather work for it, you can install your own CouchDB and Little Library by doing the following:

1.  Download a version of CouchDB above 1.3 from http://www.couchbase.com/downloads/ or grab the latest (>=1.1) official Apache CouchDB at http://couchdb.apache.org/downloads.html and install it.

2.	In a Web browser, go to the following address: http://127.0.0.1:5984/_utils/index.html

3.	Click on the bottom right of the page to set up a new Admin (Admin Party, Fix This!), and set up a new Admin with the username and password of your choice (username can contain only lowercase letters and numbers, password should begin with a letter).

4.	Create a new database called "library".

5.	In a Web browser, go to the following address: http://127.0.0.1:5984/_utils/replicator.html 

6.	Replicate changes from: Remote Database "http://library.ic.tl/library" (Paste this address into the box), Replicate changes to: Local Database "library" (Paste the word library into the box), Click on the "Replicate" button.

7.	Click on "Overview" on the top left.

8.	Click on "_users".

9.	Click on the link that says "org.couchdb.user:username" (with your username instead of the word "username")

10.	Click "Delete Document" on the top.

11.	Log out on the bottom right.

12.	In a Web browser, go the following address: http://127.0.0.1:5984/library/_design/library/index.html

13.	Sign up with the same username and password you chose earlier (username can contain only lowercase letters and numbers, password should begin with a letter).

From there, you can add content to the different categories in your library. Anyone can grab content from your library with just your online database URL (you'll find this URL on the about.html page in your library), and can share content with you by sharing their URL. But only you can edit your content. You can use the library to sync two or more accounts as well. Just go to sync from someone else's library (set to continuous sync), and ask them sync from yours (set to continuous sync). Now if either of you make any changes to your online or offline libraries, the other libraries will be synced as soon as all libraries are connected via the internet again. If there is a conflict between two different updates, the earliest update will win (and the other will be saved as a previous version). 

### Build Your Own Little Library Based Application

If you want to build your own Little Library based application, feel free to. All of the software is released under MIT, Apache 2.0, and/or GPL licenses. 

You'll just need to change the variables in the top of the library.js file (lines 10, 11, 12 & 13), and several variables in the two php files: library.php (lines 16, 17, 19, 22, 86 & 87) and  version.php (lines 17, 18, 20, 23, 97, & 98). Then you'll put library.php onto a server, set up a couchdb online somewhere and locally. On your couchdb, you can either just replicate with The Little Library template at library.ic.tl/library, or you can upload all of these files (other than library.php and version.php) into a design document and build away (check out the validate_doc_update, views, etc. in the library.ic.tl/librar/_design/library document to see how this is currently implemented). 

### Uninstall

Check out the GitHub Little Library wiki (https://github.com/rwadholm/The-Little-Library/wiki/Delete-Your-Little-Library-Locally) for instructions on uninstalling the Little Library. Feel free to make any changes you deem necessary to the wiki to make it more accurate and helpful. 