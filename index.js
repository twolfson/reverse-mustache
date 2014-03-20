var mustache = require('mustache');
var writer = new mustache.Writer();

console.log(writer.parse('hello {{world}}'));
