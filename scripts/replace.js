/* the script runs in a sandbox
$ -> is the DOM document to be parsed
result -> is the JSON object containing the result of parsing
*/

/* Given the following HTML code
<html>
<head>
<title>local scraping</title>	
</head>
<body>
<p class="Paragrafo"> Lorem ipsum <span> dolor sit </span> amet </p>
<p class="Paragrafo"><span class="Immagine"><img class="frame-1" src="/image/fig1.jpeg" alt="fig1.tif"/></span></p>
<p class="Paragrafo"> Lorem ipsum dolor sit amet </p>
<p class="Paragrafo"><span class="ImmagineCentrata"><img class="frame-2" src="/image/fig2.jpeg" alt="fig2.tif"/></span></p>
</body>
</html>
*/

result = {};
var imgs = $('img').toArray();
$.each(imgs, function(index, elem) {
			var cls = $(elem).parent().attr('class');
			var source = $(elem).attr('src');
			var div = $('<div class = "' + cls + '"><img src="' + source + '"/></div>');
			$(elem).parent().parent().replaceWith(div)
});

result.replaced = $.html() || '';

/* we get this
<html>
<head>
<title>local scraping</title>	
</head>
<body>
<p class="Paragrafo"> Lorem ipsum <span> dolor sit </span> amet </p>
<div class="Immagine"><img src="/image/fig1.jpeg"/></div>
<p class="Paragrafo"> Lorem ipsum dolor sit amet </p>
<div class="ImmagineCentrata"><img src="/image/fig2.jpeg"/></div>
</body>
</html>
*/
