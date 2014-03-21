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

// Bleh, not straight forward.

// This says depth first traversal. Let's do that and aim for the first working solution.

function dfs(tokens) {
  var i = 0;
  var len = tokens.length;
  for (; i < len; i++) {
    var token = tokens[i];
    switch (token) {
      case '#': // If/loop
        // Treat as `if` for now
        break;
      case 'text':
        break;
    }
  }
}
dfs(ast);
