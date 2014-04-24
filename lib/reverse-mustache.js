// Load in library dependencies
var assert = require('assert');
var deepClone = require('clone');
var mustache = require('mustache');
var Context = require('./context');
var Parser = require('./parser');

// DEV: This is not a perfect backtrack engine, I wonder if this is more/less performant that one.
// DEV: If we were to use regular expressions, we would lose accuracy of re-using variable values (and potentially have contradictions)

function parseTemplate(template, params) {
  // Interpret the template
  var parsedTokens = mustache.parse(template, params.tags);

  // Walk the tokens and reverse all partials
  // DEV: We must clone here since mustache has an internal cache
  var inlinedTokens = inlinePartials(deepClone(parsedTokens), params);
  return inlinedTokens;
}

// Define function to take care of any precomputed logic
function inlinePartials(tokens, params) {
  // If there are no partials, return early
  var partials = params.partials;
  if (!partials) {
    return tokens;
  }

  // Recurse through the tokens and update and partials to their inline equivalent
  var i = 0;
  var len = tokens.length;
  for (; i < len; i++) {
    var token = tokens[i];
    var type = token[0];
    switch (type) {
      case '#': // If/loop
      case '^': // Inverted if
        var subtokens = token[4];
        token[4] = inlinePartials(subtokens, params);
        break;
      case '>': // Partial (already reversed)
        // https://github.com/janl/mustache.js/blob/0.8.1/mustache.js#L497-L501
        var val = (typeof partials === 'function') ? partials(token[1]) : partials[token[1]];
        if (val !== null && val !== undefined) {
          var partialTokens = parseTemplate(val, params);
          var spliceArgs = partialTokens;
          spliceArgs.unshift(i, partialTokens.length);
          tokens.splice.apply(tokens, spliceArgs);
        }
        break;
    }
  }

  // Return the modified tokens
  return tokens;
}

// Define recursive function to perform depth-first traversal
function dfs(context, tokens) {
  var token = tokens[0];

  // If there are no tokens left, return context (truthy value, yey)
  if (!token) {
    return context;
  }

  // Depending on the type of the token
  // DEV: I dislike the amount of parameters we have on these functions but at least they are consistent =/
  // https://github.com/janl/mustache.js/blob/0.8.1/mustache.js#L462-L513
  var type = token[0];
  switch (type) {
    case '#': // If/loop
      return Parser.reverseLoop(context, token, tokens, dfs);
    case '^': // Inverted if
      return Parser.reverseInverted(context, token, tokens, dfs);
    case '>': // Partial
      // These should already have been reversed meaning this was not found
      // As a result, skip it
      return Parser.reverseNoop(context, token, tokens, dfs);
    case '&': // Unescaped variable
    case 'name': // Escaped variable
      return Parser.reverseVariable(context, token, tokens, dfs);
    case 'text': // Text
      return Parser.reverseText(context, token, tokens, dfs);
    case '!': // Comment
      return Parser.reverseNoop(context, token, tokens, dfs);
    // DEV: Due to potentially custom templates, warn users that we don't support their types
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
  var tokens = parseTemplate(params.template, params);

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
reverseMustache.parseTemplate = parseTemplate;
reverseMustache.unescapeHtml = require('./utils/unescape-html');
module.exports = reverseMustache;
