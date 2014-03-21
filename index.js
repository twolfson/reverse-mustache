var mustache = require('mustache');
var template = 'hello {{#world}}moon{{/world}}';

var ast = mustache.parse(template);
var content = mustache.render(template, {world: true});

console.log(ast[1]);
console.log(content);

// TODO: We should still probably draw out an automata diagram
// But... let's re-invent regular expressions with booleans

// Works well in prolog. I am sure there is a better way to do it.
// ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd'] = ['h', 'e', 'l', 'l', 'o', X1, X2, X3, X4, X5]

// TODO: We probably want one of these http://en.wikipedia.org/wiki/Backtracking

var tokens = ast;
tokens.forEach(function iterateNode (token) {
  var type = token[0];
  switch (type) {
    case '#':
      // If/For
      break;
    case 'text':

  }
});
