// ==UserScript==
// @name           Tumblr H8
// @namespace      h8cloud
// @description    Provides a link to let you "h8" a post (as opposed to "<3"). H8ed posts and their reblogs are hidden from you forever!
// @include        http://www.tumblr.com/dashboard
// @include        http://www.tumblr.com/dashboard/*
// @exclude        http://www.tumblr.com/dashboard/iframe*
// @copyright      2k9, Julia West (http://h8cloud.com)
// @license        (CC) Attribution-Share Alike 3.0 United States; http://creativecommons.org/licenses/by-sa/3.0/us/
// ==/UserScript==

var h8ed	= GM_getValue("h8ed", "").split(",");
if (h8ed == "") h8ed = [];

window.addEventListener(
	'load',
	function() {
		addH8Links();
		hideAllH8ed();
		hideAllH8Reblogs();
	}, true
);

function addToH8ed( id ) {
	if ( !alreadyH8ed(id) ) {
		h8ed.push(id);
		GM_setValue("h8ed", h8ed.join(","));
	}
}

function removeFromH8ed( id ) {
	var index = h8ed.indexOf( id );
	if ( index != -1 ) {
		h8ed.splice( index, 1 );
		GM_setValue("h8ed", h8ed.join(","));
	}
}

function alreadyH8ed( id ) {
	return (h8ed.indexOf( id ) != -1);
}

function addH8Links(){
	var heartLinks = document.evaluate(
	    '//form[contains(@action,"/like/")]',
	    document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	
	for (var i = 0; i < heartLinks.snapshotLength; i++) {
	    var thisLink	= heartLinks.snapshotItem(i);
			var thisID		= thisLink.id.split("like_form_")[1];
			
			var h8Link = document.createElement('a');
			h8Link.setAttribute("onclick", "return false;" );
			h8Link.className = "h8";
			h8Link.href = thisID;
			h8Link.innerHTML = "h8";
			if ( alreadyH8ed(thisID) ){ h8Link.setAttribute("style", "color: #d32a2a;")}
			
			h8Link.addEventListener('click', h8Event, true);
			thisLink.parentNode.insertBefore(h8Link, thisLink.nextSibling);
	}	
}

function hideAllH8ed(){
	for( var i=0; i <= h8ed.length; i++ ) {
		hide( h8ed[i] );
	}
}

function hideAllH8Reblogs(){
	var reblogs = document.evaluate(
		'//li[contains(@class, "is_reblog")]',
		document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);

	for (var i = 0; i < reblogs.snapshotLength; i++) {
		var reblog = reblogs.snapshotItem(i);
		var post_info = reblog.getElementsByClassName("post_info")[0];
		
		var match = false;
		for(j=0; j< h8ed.length; j ++) {
			var id = h8ed[j];
			if (post_info.innerHTML.match( new RegExp(id))){
				match = true;
				break;
			}
		}
		
		if (match) h8Reblog(reblog);
	}
}

function hide( id ) {
	post = document.getElementById("post" + id);
	
	if (post) {
		post.style.display = 'none';

		var hidden_notice = document.createElement('li');
		hidden_notice.className = 'notification first_notification last_notification';
		hidden_notice.innerHTML = 'You h8ed this post. <a onclick="this.parentNode.style.display=\'none\'; this.parentNode.previousSibling.style.display=\'\'; return false;" href="#"><i>See it anyway.</i></a>';

		post.parentNode.insertBefore(hidden_notice, post.nextSibling);
	}
}
 
function h8Event(event){
	var link = event.target;
	var id = link.href.split("/").pop();
	
	h8Post(id, link);
}

function h8Reblog(reblog) {
	var id = reblog.id.split("post")[1];
	
	var h8Link = document.evaluate(
		'//a[@href="' + id + '"]',document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );
		
	h8Link = h8Link.snapshotItem(0);
	h8Post(id, h8Link);
}

function h8Post( id, link ){
	if ( !alreadyH8ed( id )) {
		addToH8ed( id );
		link.setAttribute("style", "color: #d32a2a;");
		hide(id);
	} else {
		removeFromH8ed( id );
		link.setAttribute("style", "");
	}
}