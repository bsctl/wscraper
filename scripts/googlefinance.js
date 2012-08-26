/* the script runs in a sandbox
$ -> is the DOM document to be parsed
result -> is the JSON object containing the result of parsing
*/

/* at time of writing, google.com/finance reports financial data of public companies in the following html;
we scrape the current values (USD) of the company stocks and return it

<div id="price-panel" class="id-price-panel goog-inline-block">
<div>
<span class="pr">
	<span id="ref_22144_l">656.06</span>
</span>
<div class="id-price-change nwp goog-inline-block">
<span class="ch bld"><span class="chr" id="ref_22144_c">-9.09</span>
<span class="chr" id="ref_22144_cp">(-1.37%)</span>
</span>
</div>
</div>
<div>After Hours:&nbsp;<span class="bld" id="ref_22144_el">656.71</span>
<span id="ref_22144_ec" class="chg">+0.65</span>
<span id="ref_22144_ecp" class="chg">(0.10%)</span>
<div id="ref_22144_elt">Aug 21, 5:53PM EDT&nbsp;&nbsp;<div class="mdata-dis">
<span class="dis-large"><nobr>NASDAQ
real-time data -
<a href="http://www.google.com/help/stock_disclaimer.html#realtime" class="dis-large">Disclaimer</a>
</nobr></span>
<div>Currency in USD</div>
</div>
</div>
</div>
</div>

*/
result = {};
price = $('div.id-price-panel').find('span.pr').children().text();
result.price = price || '';