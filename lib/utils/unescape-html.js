// Reverse HTML escapes
// https://github.com/janl/mustache.js/blob/0.8.1/mustache.js#L53-L66
var reverseEntityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&#x2F;': '/'
};
var reverseEntityRegExp = /(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;)/g;
function unescapeHtml(string) {
  return String(string).replace(reverseEntityRegExp, function (s) {
    return reverseEntityMap[s];
  });
}

module.exports = unescapeHtml;
