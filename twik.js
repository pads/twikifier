/*jslint unparam: true, indent: 4, node: true */

"use strict";

var async = require('async'),
	Emitter = require('events').EventEmitter;

// utility funcions for twikify and twikifier related things
var twik = {};

twik.formatText = function(window, wikify, text) {
	// create a browser window
	var place = window.document.getElementById('tiddler');

	// wikify the tiddler text.
	// XXX This should be functional, returning a string,
	// not building up the dom in place.
	wikify(text, place, null, null);

	return window.document.innerHTML;
};

twik.loadRemoteTiddlers = function(store, Tiddler, uri, jsonTiddlers) {
	var tiddlers = JSON.parse(jsonTiddlers), // TODO: make async?
		storeURL,
		emitter = new Emitter();

	function addToStore(item, errcallback) {
		var t = new Tiddler(item.title);
		t.tags = item.tags;
		t.modifier = item.modifier;
		t.modified = Date.convertFromYYYYMMDDHHMM(item.modified);
		t.created = Date.convertFromYYYYMMDDHHMM(item.created);
		t.fields = item.fields;
		store.addTiddler(t);
		errcallback();
	}

	function finishUp(err) {
		storeURL = new Tiddler('SiteUrl');
		storeURL.text = uri;
		storeURL.tags = ['excludeLists'];
		store.addTiddler(storeURL);
		emitter.emit('done', store);
	}

	async.eachSeries(tiddlers, addToStore, finishUp);
	return emitter;
};


if (exports !== "undefined") {
	exports.formatText = twik.formatText;
	exports.loadRemoteTiddlers = twik.loadRemoteTiddlers;
}
