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

function dfs(content, tokens) {
  var i = 0;
  var len = tokens.length;
  var tokensByName = {};
  var meta = {};
  // TODO: We should be re-using tokensByName from top-levels (via deep clone)
  // TODO: Figure out how the hell to deal with subpaths (maybe getval, setval)
  // TODO: We are going to need to use sub-tokensByName as with mustache. Maybe re-use their lookup tooling?
  var retObj = {
    meta: meta,
    tokensByName: tokensByName
  };
  for (; i < len; i++) {
    var token = tokens[i];
    var type = token[0];
    switch (type) {
      case '#': // If/loop
        // Treat as `if` for now
        // TODO: Recurse but I am out of time
        // TODO: This is going to have to stop matching the subcontent at some point
        // hello {{moon}} and more
        var subtokens = token[4];
        var result = dfs(content, subtokens);

        // If the content matched, save our boolean as true
        if (result) {
          tokensByName[token[1]] = true;
          // TODO: These actions can probably be abstracted
          content = content.slice(result.meta.length);
          meta.length = (meta.length || 0) + result.meta.length;
        // Otherwise, mark the boolean as false
        // DEV: This will fail on future steps if it is not `false` either
        } else {
          tokensByName[token[1]] = false;
        }
        break;
      case 'text': // Text
        // Slice the next snippet of text
        var expectedText = token[1];
        var actualText = content.slice(0, expectedText.length);

        // If it does not match, reject it
        if (actualText !== expectedText) {
          return false;
        } else {
          meta.length = (meta.length || 0) + expectedText.length;
          content = content.slice(expectedText.length);
        }
        break;
    }
  }
  return retObj;
}
console.log('result ', dfs(content, ast));
