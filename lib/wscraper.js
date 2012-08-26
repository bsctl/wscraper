/*
 * wscraper.js: a web scraper agent based on cheerio.js a fast, flexible, and lean implementation of core jQuery;
 * built on top of request.js;
 * inspired by http-agent.js;
 *
 * (C) 2012 Kalise
 * MIT LICENSE
 *
 */

var	fs = require('fs'),
	util = require('util'),
	EventEmitter = require("events").EventEmitter,
	vm = require('vm'),
	request = require('request'),
	cheerio = require('cheerio'),
	Iconv  = require('iconv').Iconv;

exports.createAgent = function () {
	 return new WebScraper();
};

var WebScraper = function () {
	EventEmitter.call(this);
	this.host = '';	
	this.paths = [];
	this.script = '';
	this.sandbox = {
		$: '', // $ -> is the DOM document to be parsed
		result: {} // result -> is the JSON object containing the result of parsing
	};	
	this.running = false;
	this.unvisited = []; 	
	this.options = {
		uri: '',
		method: 'GET',
		headers: { 'accept-charset':'UTF-8', 'accept':'text/html' },
		encoding: null
	};
};

util.inherits(WebScraper, EventEmitter);

WebScraper.prototype.start = function(host, paths, script) {
	if (!this.running) {
	    this.running = true;
		this.host = host || 'localhost';
		if ((paths instanceof Array) && paths.length) {
			this.paths = paths		
		};
		if (typeof paths === 'string') {
			this.paths[0] = paths
		};
		this.script = script || '';
		// in javascript, assigning an array or an object to a variable makes a reference to the value,
		// so we are using the slice(0) function to make a copy of the array.
		this.unvisited = this.paths.slice(0);	
	    this.emit('start', this.paths.length);
	    this.next();
	}
	else util.log('[wscraper.j] agent is still running, use agent.stop() before to start it again');
};

WebScraper.prototype.stop = function() {
	if (this.running) {
	    this.running = false;
	    this.emit('stop', this.unvisited.length);
	}
	else util.log('[wscraper.j] agent is not running, use agent.start() before to stop it');
};

WebScraper.prototype.next = function() {
	if (this.running) {		
		if (this.unvisited.length > 0) {
			var path = this.unvisited.shift();
			var url = '';
			if (path.indexOf('/') == 0) {
				url = 'http://' + this.host + path;
			} else {
				url = 'http://' + this.host + '/' + path;
			};			
			util.log('[wscraper.js] sending a request to: ' + url);
			this.options.uri = url;
			var self = this;
			request(self.options, function (error, response, body) {
				// currently only 200 Ok code is expected as valid for web scraping
				// TODO: handle 3XX (redirections) status codes
				if (error || response.statusCode !=200) {
					self.emit('abort', 'error or bad response from ' + url);
					return
				};
				var data = body || {};
				// check the enconding header in the response.headers['content-type'] in order to understand the encoding used by the server
				// TODO: support all conversions supported by iconv.js
				var encoding = 'UTF-8';
				if (response.headers['content-type'].match('charset=ISO-8859-1')) {
					encoding = 'ISO-8859-1';
				};
				if (encoding != 'UTF-8') { // convert data stream from ISO-8859-1 to UTF-8 encoding
					var iconv = new Iconv(encoding, 'UTF-8');
					data = iconv.convert(body);
				}
				// load the data in the sandbox
				self.sandbox.$ = cheerio.load(data.toString());
				try {
					// run the script in the sandbox
					vm.runInNewContext(self.script, self.sandbox);
				} catch (e) {
				    self.emit('abort', e); // catch any error from the script
					return;
				}
				if (self.sandbox.result) {
					self.emit('done', url, self.sandbox.result)
				} else {
					self.emit('abort', 'parsing script is returning null value!')
				};
			})	
		}
		else {
			this.stop();
		}
	}
	else util.log('[wscraper.j] agent is not running, start it by calling agent.start()');
};

// use of the Scraper object without make any http request
exports.createScraper = function () {
	 return new Scraper();
};
	
var Scraper = function () {
	EventEmitter.call(this);
	this.html = '';
	this.script = '';
	this.sandbox = {
		$: '', // $ -> is the DOM document to be parsed
		result: {} // result -> is the JSON object containing the result of parsing
	};	
};

util.inherits(Scraper, EventEmitter);

Scraper.prototype.run = function (html, script) {
	this.html = html || '';
	this.script = script || '';
	this.emit('run');
    this.sandbox.$ = cheerio.load(this.html);
	// run the loaded script in a sandbox
	try {
		vm.runInNewContext(this.script.toString(), this.sandbox);
		// emit the "done" event and pass the result to the callback function
	} catch (e) {
	    this.emit('abort', e);
		return;
	}
	if (this.sandbox.result) {
		this.emit('done', this.sandbox.result)
	} else {
		this.emit('abort', 'parsing script is returning null value!')
	};	
}




