// node.js libraries
var	util = require('util');
var	fs = require('fs');
var	scraper = require('../lib/wscraper');

// var html = "<html><head><title>local scraper</title></head><body><p>hello world!</p></body></html>";

var html = fs.readFileSync('../scripts/index.html');
var script = fs.readFileSync('../scripts/replace.js');

var scraper = scraper.createScraper();

scraper.on('done', function(result) {
	util.log(result);
	fs.writeFileSync('../scripts/replaced.html', result);
});

scraper.on('abort', function(e) {
	util.log('Getting error in parsing: ' + e)
});

scraper.run(html);


