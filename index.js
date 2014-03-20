var mustache = require('mustache');
var template = 'hello {{world}}';

console.log(mustache.parse(template));
console.log(mustache.render(template, {world: 'moon'}));

// Works well in prolog. I am sure there is a better way to do it.
// ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd'] = ['h', 'e', 'l', 'l', 'o', X1, X2, X3, X4, X5]
