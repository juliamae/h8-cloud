scr_meta=<><![CDATA[ 
// ==UserScript==
// @name           Tumblr H8
// @namespace      h8cloud
// @description    Provides a link to let you "h8" a post (as opposed to "<3"). H8ed posts and their reblogs are hidden from you forever!
// @include        http://www.tumblr.com/dashboard
// @include        http://www.tumblr.com/dashboard/*
// @exclude        http://www.tumblr.com/dashboard/iframe*
// @version        0.4.0
// @copyright      2k9, Julia West (http://h8cloud.com)
// @license        (CC) Attribution-Share Alike 3.0 United States; http://creativecommons.org/licenses/by-sa/3.0/us/
// ==/UserScript==
]]></>;

// Change this value to false if you do not want the posts you h8 to (anonymously) go to h8cloud.com
var sendH8 = true;

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
		var post = document.getElementById("post" + h8ed[i]);
		if (post) hide( post );
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


function hide( post ) {
		post.style.display = 'none';

		var hidden_notice = document.createElement('li');
		hidden_notice.className = 'notification first_notification last_notification';
		hidden_notice.innerHTML = 'You h8ed this post. <a onclick="this.parentNode.style.display=\'none\'; this.parentNode.previousSibling.style.display=\'\'; return false;" href="#"><i>See it anyway.</i></a>';

		post.parentNode.insertBefore(hidden_notice, post.nextSibling);
}
 
function h8Event(event){
	var link = event.target;
	var id = link.href.split("/").pop();
	
	h8Post(id, link, false);
}

function h8Reblog(reblog) {
	var id = reblog.id.split("post")[1];
	
	var h8Link = document.evaluate(
		'//a[@href="' + id + '"]',document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null );
		
	h8Link = h8Link.snapshotItem(0);
	h8Post(id, h8Link, true);
}

function h8Post( id, link, via_reblog ){
	if ( !alreadyH8ed( id )) {
		link.setAttribute("style", "color: #d32a2a;");
		addToH8ed( id );
		var post = document.getElementById("post"+id);
		if (sendH8 && !via_reblog) sendH8ToCloud(id, post);
		if (post) hide(post);
	} else {
		removeFromH8ed( id );
		link.setAttribute("style", "");
	}
}

function previousPostInfo(post){
	var prev = post.previousSibling;
	if (prev.nodeType == 1 && prev.tagName == "LI" && prev.className.indexOf("post") != -1){
		var post_info = prev.getElementsByClassName("post_info")[0];
		if (post_info == undefined) return previousPostInfo(prev);
		else return post_info;
	} else return previousPostInfo(prev);
}

function sendH8ToCloud(id, post) {
	var tumblog;
	var post_info = post.getElementsByClassName("post_info")[0];
	if (post_info == undefined){
		tumblog = previousPostInfo(post).getElementsByTagName("a")[0].innerHTML;
	} else {
		tumblog = post_info.getElementsByTagName("a")[0].innerHTML;
	}
	var dataString = "4f5fbab1e61e6258868eb2d0368670d897898b7d=c12adb9249d4ade19867745545d62667f2f20c55&id=" + id + "&meta=" + tumblog;
	
	GM_xmlhttpRequest({
		method: 'POST',
		url: 'http://koffing.h8cloud.com/posts/',
		headers: {
			'User-agent': 'Mozilla/4.0 (compatible) Greasemonkey',
			'Content-type': 'application/x-www-form-urlencoded'
		},
		data: dataString
	});
}

// Update Notifier Script
CheckScriptForUpdate = {
	// Config values, change these to match your script
	id: '45673', // Script id on Userscripts.org
	days: 1, // Days to wait between update checks
	name: /\/\/\s*@name\s*(.*)\s*\n/i.exec(scr_meta)[1],
	version: /\/\/\s*@version\s*(.*)\s*\n/i.exec(scr_meta)[1],
	time: new Date().getTime() | 0,
	call: function(response) {
		GM_xmlhttpRequest({
			method: 'GET',
			url: 'https://userscripts.org/scripts/source/'+this.id+'.meta.js',
			headers: {
				'User-agent': window.navigator.userAgent,
				'Accept': 'application/atom+xml,application/xml,text/xml',
			},
			onload: function(xpr) {CheckScriptForUpdate.compare(xpr,response);}
		});
	},
	compare: function(xpr,response) {
		this.xversion=/\/\/\s*@version\s*(.*)\s*\n/i.exec(xpr.responseText)[1];
		this.xname=/\/\/\s*@name\s*(.*)\s*\n/i.exec(xpr.responseText)[1];
		if ( (this.xversion != this.version) && (confirm('A new version of the '+this.xname+' user script is available. Do you want to update?')) ) {
			GM_setValue('updated', this.time);
			GM_openInTab('http://userscripts.org/scripts/source/'+this.id+'.user.js');
		} else if ( (this.xversion) && (this.xversion != this.version) ) {
			if(confirm('Do you want to turn off auto updating for this script?')) {
				GM_setValue('updated', 'off');
				GM_registerMenuCommand("Auto Update "+this.name, function(){GM_setValue('updated', new Date().getTime() | 0);CheckScriptForUpdate.call('return');});
				alert('Automatic updates can be re-enabled for this script from the User Script Commands submenu.');
			} else {
				GM_setValue('updated', this.time);
			}
		} else {
			if(response) alert('No updates available for '+this.name);
			GM_setValue('updated', this.time);
		}
	},
	check: function() {
		if (GM_getValue('updated', 0) == 0) GM_setValue('updated', this.time);
		if ( (GM_getValue('updated', 0) != 'off') && (+this.time > (+GM_getValue('updated', 0) + (1000*60*60*24*this.days))) ) {
			this.call();
		} else if (GM_getValue('updated', 0) == 'off') {
			GM_registerMenuCommand("Enable "+this.name+" updates", function(){GM_setValue('updated', new Date().getTime() | 0);CheckScriptForUpdate.call(true);});
		} else {
			GM_registerMenuCommand("Check "+this.name+" for updates", function(){GM_setValue('updated', new Date().getTime() | 0);CheckScriptForUpdate.call(true);});
		}
	}
};
if (self.location == top.location && GM_xmlhttpRequest) CheckScriptForUpdate.check();