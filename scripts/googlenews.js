/* the script runs in a sandbox
$ -> is the DOM document to be parsed
result -> is the JSON object containing the result of parsing
*/

/* at time of writing, google.com/news reports news title like in the following html;
   we scrape all occurrency of news titles and return them as an Array
 
<h2 class="esc-lead-article-title">
	<a target="_blank" class="article">
		<span class="titletext">What you can buy for the price of 1 Apple share</span>
	</a>
</h2>
*/

result = {};
var titles = $('h2.esc-lead-article-title').toArray(); 
$.each(titles, function(index, elem) {
			result[index] = $(elem).children().children().text();
});