var mustache = require('mustache');
var template = 'hello {{#world}}moon{{/world}}';

var ast = mustache.parse(template);
var content = mustache.render(template, {world: true});

// console.log(ast[1]);
// console.log(content);

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
    var type = token[0];
    switch (type) {
      case '#': // If/loop
        // Treat as `if` for now
        // Try out using content as `true`

        // Try out using content as `false`

        // If neither worked, reject it
        console.log(token, content);
        break;
      case 'text': // Text
        // Slice the next snippet of text
        var expectedText = token[1];
        // TODO: We should have a progressive portion of content
        var actualText = content.slice(0, expectedText.length);

        // If it does not match, reject it
        if (actualText !== expectedText) {
          return false;
        } else {
          content = content.slice(expectedText.length);
        }
        break;
    }
  }
}
dfs(ast);
