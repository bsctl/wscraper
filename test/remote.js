// load node.js libraries
var	util = require('util');
var	scraper = require('../lib/wscraper');
var	fs = require('fs');

// begin
util.log('[wscraper.js] scraping process has started');

// load the script file (synch version)
var script = fs.readFileSync('../scripts/googlenews.js');

// create a web scraper agent instance
var agent = scraper.createAgent();

agent.on('start', function (n) {
	util.log('[wscraper.js] agent has started; ' + n + ' path(s) to visit');
});

agent.on('done', function (url, result) {
	var news = JSON.stringify(result);
	// display the results	
	util.log('[wscraper.js] scraped data from ' + url);
	util.log(news);
	// no other items to process, so stop the agent
	agent.stop();		
});

agent.on('stop', function (n) {
	util.log('[wscraper.js] agent has ended; ' + n + ' path(s) remained to visit');
});

agent.on('abort', function (e) {
	util.log('[wscraper.js] getting a FATAL ERROR [' + e + ']');
	util.log('[wscraper.js] agent has aborted');
	process.exit();
});

// run the web scraper
agent.start('google.com', '/news', script);
