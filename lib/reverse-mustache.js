// Load in library dependencies
var assert = require('assert');
var mustache = require('mustache');
var Context = require('./context');
var unescapeHtml = require('./utils/unescape-html');
var Parser = require('./parser');

// DEV: This is not a perfect backtrack engine, I wonder if this is more/less performant that one.
// DEV: If we were to use regular expressions, we would lose accuracy of re-using variable values (and potentially have contradictions)

// Define recursive function to perform depth-first traversal
function dfs(context, tokens) {
  var token = tokens[0];

  // If there are no tokens left, return context (truthy value, yey)
  if (!token) {
    return context;
  }

  // Depending on the type of the token
  var type = token[0];
  var name = token[1];
  switch (type) {
    case '#': // If/loop
      return Parser.reverseLoop(context, token, tokens, dfs);
    case '&': // Unescaped variable
    case 'name': // Escaped variable
      // If the variable is already defined
      var val = context.getToken(name);
      if (val !== undefined) {
        // If the remaining content is longer than what we have, reject it
        if (val.length > context.remainingContent.length) {
          return null;
        }

        // Otherwise, attempt to ues it
        var proposedContext = context.clone();
        proposedContext.addStr(val);
        var resultContext = dfs(proposedContext, tokens.slice(1));
        return resultContext;
      }

      // Looping from the entire remaining string to the first character (varying width, fixed at the first character)
      // DEV: This is a greedy regular expression. yey.
      var remainingContent = context.remainingContent;
      var i = remainingContent.length;
      for (; i >= 0; i -= 1) {
        // Attempt to use the substring as a match
        // TODO: There can probably be optimizations for trimming left content (a la quicksort) or even better regexp engines
        var proposedContext = context.clone();
        var proposedStr = remainingContent.slice(0, i);

        // Unescape any escaped variabled
        // https://github.com/janl/mustache.js/blob/0.8.1/mustache.js#L506-L509
        var proposedTokenVal = proposedStr;
        if (type === 'name') {
          proposedTokenVal = reverseMustache.unescapeHtml(proposedStr);
        }
        proposedContext.setToken(name, proposedTokenVal);

        // Continue with the match attempt
        proposedContext.addStr(proposedStr);
        var resultContext = dfs(proposedContext, tokens.slice(1));

        // DEV: If we ever do a `matchAll` method, this will make every other action run `n` times (i.e. n^m runtime, n = characters, m = decisions)
        // If we matched successfully, use the result context
        if (resultContext) {
          return resultContext;
        // Otherwise, continue
        } else {
          continue;
        }
      }

      // If there were no matches, return nothing
      return null;
    case 'text': // Text
      // Slice the next snippet of text
      var expectedText = name;
      var actualText = context.remainingContent.slice(0, expectedText.length);

      // If it does not match, reject it
      if (actualText !== expectedText) {
        // TODO: This shouldn't be a return but walk back in `for` loop for previous decisions (e.g. `true` over `false`)
        return null;
      // Otherwise, attempt to use it and pass it through
      } else {
        var proposedContext = context.clone();
        proposedContext.addStr(expectedText);

        var resultContext = dfs(proposedContext, tokens.slice(1));
        return resultContext;
      }
      break;
    default:
      throw new Error('`reverseMustache` did not recognize type "' + type + '" for token ' + JSON.stringify(token));
  }
}

function reverseMustache(params) {
  // Make assertions about parameters
  assert(params, '`reverseMustache` expects `params` to be provided');
  assert(params.template, '`reverseMustache` expects `params.template` to be provided');
  assert(params.content, '`reverseMustache` expects `params.content` to be provided');

  // Interpret the template
  var tokens = mustache.parse(params.template);

  // Run our depth first traversal
  var context = new Context(params.content);
  var result = dfs(context, tokens);

  // If there was no match, return `null`
  if (!result) {
    return null;
  // Otherwise, if we did not match al the content, return `null`
  } else if (result.remainingContent !== '') {
    return null;
  // Otherwise, return the result's tokens
  } else {
    return result.tokensByName;
  }
}

// Export `reverseMustache` and `unescapeHtml`
reverseMustache.unescapeHtml = unescapeHtml;
module.exports = reverseMustache;
