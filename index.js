var mustache = require('mustache');
var template = 'hello {{world}}';

console.log(mustache.parse(template));
console.log(mustache.render(template, {world: 'moon'}));
