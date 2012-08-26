# wscraper

wscraper.js is a web scraper agent written in node.js and based on [cheerio.js][0] a fast, flexible, and lean implementation of core jQuery;
It is built on top of [request.js][1] and inspired by [http-agent.js][2];

## Usage 

There are two ways to use wscraper: http agent mode and local mode. 

### HTTP Agent mode
In HTTP Agent mode, pass it a host, a list of URLs to visit and a scraping JS script. For each URLs, the agent makes a request, gets the response, runs the scraping script and returns the result of the scraping. Valid usage is:

```js
// scrape a single page from a web site
var agent = wscraper.createAgent();
agent.start('google.com', '/finance', script);

// scrape multiple pages from a website
wscraper.start('google.com', ['/', '/finance', '/news'], script);
```

The URLs should be passed as an array of strings. In case only one page needs to be scraped, the URL can be passed as a single string. Null or empty URLs are treated as  root '/'. Suppose you want to scrape from http://google.com/finance website the stocks price of the following companies: Apple, Cisco and Microsoft.

```js
// load node.js libraries
var	util = require('util');
var	wscraper = require('wscraper');
var	fs = require('fs');

// load the scraping script from a file
var script = fs.readFileSync('/scripts/googlefinance.js');

var companies = ['/finance?q=apple', '/finance?q=cisco', '/finance?q=microsoft'];

// create a web scraper agent instance
var agent = wscraper.createAgent();

agent.on('start', function (n) {
	util.log('[wscraper.js] agent has started; ' + n + ' path(s) to visit');
});

agent.on('done', function (url, price) {
	util.log('[wscraper.js] data from ' + url);
	// display the results	
	util.log('[wscraper.js] current stock price is ' + price + ' USD');
	// next item to process if any
	agent.next();		
});

agent.on('stop', function (n) {
	util.log('[wscraper.js] agent has ended; ' + n + ' path(s) remained to visit');
});

agent.on('abort', function (e) {
	util.log('[wscraper.js] getting a FATAL ERROR [' + e + ']');
	util.log('[wscraper.js] agent has aborted');
	process.exit();
});

// run the web scraper agent
agent.start('www.google.com', companies, script);
```

The scraping script should be pure client JavaScript, including JQuery selectors. See [cheerio.js][0] for details. I should return a valid JavaScript object.
The scraping script is passed as a string and usually is read from a file. You can scrape different websites without change any line of the main code: only write different JavaScript scripts.
The scraping script is executed in a sandbox using a separate VM context and the script errors are caught without crash of the main code.

At time of writing, google.com/finance website reports financial data of public companies as in the following html snippet:

```html
...
<div id="price-panel" class="id-price-panel goog-inline-block">
  <div>
    <span class="pr">
  	<span id="ref_22144_l">656.06</span>
    </span>
  </div>
</div>
...
```
By using JQuery selectors, we design the scraping script "googlefinance.js" to find the current value of a company stocks and return it as a text:

```js
/*

googlefinance.js

$ -> is the DOM document to be parsed
result -> is the object containing the result of parsing
*/

result = {};
price = $('div.id-price-panel').find('span.pr').children().text();
result.price = price;

// result is '656.06'
```

### Local mode
Sometimes, you need to scrape local html files without make a request to a remote server. Wscraper can be used as inline scraper. It takes an html string and a JS scraping script. The scraper runs the scraping script and returns the result of the scraping. Valid usage is:

```js
var scraper = wscraper.createScraper();
scraper.run(html, script);
```

Only as trivial example, suppose you want to replace the class name of <div> elements only containing an image with a given class. Create a scraper:

```js
// load node.js libraries
var	util = require('util');
var	fs = require('fs');
var	wscraper = require('wscraper');

// load your html page
var html = fs.readFileSync('/index.html');

// load the scraping script from a file
var script = fs.readFileSync('/scripts/replace.js');

// create the scraper
var scraper = wscraper.createScraper();

scraper.on('done', function(result) {
	// do something with the result
	util.log(result)
});

scraper.on('abort', function(e) {
	util.log('Getting error in parsing: ' + e)
});

// run the scraper
scraper.run(html, script);
```

By using JQuery selectors, we design the scraping script "replace.js" to find the <div> elements containing images with class="MyPhotos" and replace each of them with a <div> element having class="Hidden" without any image inside.

```js
/*
replace.js

$ -> is the DOM document to be parsed
result -> is the final JSON string containing the result of parsing
use var js-obj = JSON.parse(result) to get a js object from the json string
use JSON.stringify(js-obj) to get back a json string from the js object
*/

result = {};
var imgs = $('img.MyPhotos').toArray();
$.each(imgs, function(index, elem) {
	var parentdiv = $(elem).parent();
	var newdiv = $('<div class="Hidden"/></div>');
	$(elem).parent().replaceWith(newdiv)
});

result.replaced = $.html() || '';
```

Happy scraping!

### Author: kalise © 2012 MIT Licensed;

[0]: https://github.com/MatthewMueller/cheerio
[1]: https://github.com/mikeal/request
[2]: https://github.com/indexzero/http-agent
