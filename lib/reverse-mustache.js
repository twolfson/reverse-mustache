// Load in library dependencies
var assert = require('assert');
var mustache = require('mustache');
var deepClone = require('clone');

// TODO: We should still probably draw out an automata diagram
// But... let's re-invent regular expressions with booleans

// TODO: We probably want one of these http://en.wikipedia.org/wiki/Backtracking

// This says depth first traversal. Let's do that and aim for the first working solution.

// TODO: Since mustache is ambiguous, we should require a schema to get our feet off the ground. It will significantly help with nested info
// DEV: If we were to use regular expressions, we would lose accuracy of re-using variable values

// TODO: Instead of deep clone, consider prototypal lookup for tokens
function Context(content) {
  // Set up content and token internals
  this.originalContent = content;
  this.remainingContent = content || '';
  this.completedContent = '';
  this.tokensByName = {};
}
Context.prototype = {
  // Add a new string to the context
  addStr: function (str) {
    // Update remaining and completed content
    this.completedContent += str;
    this.remainingContent = this.remainingContent.slice(str.length);
  },

  // Update a token on the context
  setToken: function (key, val) {
    this.tokensByName[key] = val;
  },

  clone: function () {
    var context = new Context(this.originalContent);
    context.remainingContent = this.remainingContent;
    context.completedContent = this.completedContent;
    context.tokensByName = deepClone(this.tokensByName);
    return context;
  }
};

// TODO: Should this be a new method of a mustache template?
function reverseMustache(params) {
  // Make assertions about parameters
  assert(params, '`reverseMustache` expects `params` to be provided');
  assert(params.template, '`reverseMustache` expects `params.template` to be provided');
  assert(params.content, '`reverseMustache` expects `params.content` to be provided');

  // Interpret and localize parameters
  var ast = mustache.parse(params.template);
  var content = params.content;

  // Define recursive function to perform depth-first traversal
  function dfs(content, tokens) {
    var token = tokens[0];

    // TODO: We should be re-using tokensByName from top-levels (via deep clone)
    // TODO: Figure out how the hell to deal with subpaths (maybe getval, setval)
    // TODO: We are going to need to use sub-tokensByName as with mustache. Maybe re-use their lookup tooling?
    var context = new Context(content);

    // If there are no tokens left, return context
    // TODO: Is this the right thing to do?
    if (!token) {
      return context;
    }

    var type = token[0];
    console.log(token);
    switch (type) {
      case '#': // If/loop
        // Treat as `if` for now
        // TODO: This is going to have to stop matching the subcontent at some point
        // hello {{moon}} and more
        var subtokens = token[4];
        var subresult = dfs(context.remainingContent, subtokens);

        // If the content matched, attempt to save our boolean as true
        // DEV: We make this as an attempt because future content could be invalid
        if (subresult) {
          // TODO: This should have boolean set to true
          var proposedContext = context.clone();
          proposedContext.addStr(subresult.completedContent);
          var result = dfs(proposedContext.remainingContent, tokens.slice(1));

          // If we matched, accept boolean
          // TODO: Somehow inherit tokens
          if (result) {
            context.setToken(token[1], true);
            return result;
          }

          // Otherwise, continue to false
        }

        // Mark the boolean as false
        // DEV: This will fail on future steps if it is not `false` either
        context.setToken(token[1], false);
        return dfs(context.remainingContent, tokens.slice(1));
      case 'text': // Text
        // Slice the next snippet of text
        var expectedText = token[1];
        var actualText = context.remainingContent.slice(0, expectedText.length);

        // If it does not match, reject it
        if (actualText !== expectedText) {
          // TODO: This shouldn't be a return but walk back in `for` loop for previous decisions (e.g. `true` over `false`)
          return null;
        } else {
          context.addStr(expectedText);
          // TODO: Somehow inherit tokens
          return dfs(context.remainingContent, tokens.slice(1));
        }
        break;
      default:
        throw new Error('`reverseMustache` did not recognize type "' + type + '" for token ' + JSON.stringify(token));
    }
  }

  // Run our depth first traversal
  var result = dfs(content, ast);

  // If there was a result and there is remaining content, return negatively
  if (result && result.remainingContent !== '') {
    return null;
  // Otherwise, return the result
  } else {
    return result;
  }
}

// Export `reverseMustache`
module.exports = reverseMustache;
