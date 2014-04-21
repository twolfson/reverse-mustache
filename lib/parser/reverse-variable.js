var Context = require('../context');
var unescapeHtml = require('../utils/unescape-html');

module.exports = function parserLoop (context, token, tokens, dfs) {
  // If the variable is already defined
  var type = token[0];
  var name = token[1];
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
      proposedTokenVal = unescapeHtml(proposedStr);
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
};
