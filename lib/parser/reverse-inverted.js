var deepClone = require('clone');
var Context = require('../context');

module.exports = function parserInverted (context, token, tokens, dfs) {
  // If we already have the value, use it
  var name = token[1];
  var val = context.getToken(name);
  var subtokens = token[4];
  // DEV: The only lines that changed between the `if` and `else` section were the `setToken(name)` and `if no match, return null`
  if (val !== undefined) {
    // If the value is falsy
    if (!val) {
      // For each variants of the remaining string
      var i = context.remainingContent.length;
      for (; i > 0; i -= 1) {
        // Attempt to use the value
        // DEV: We use the same scope as the parent because tokens inner-tokens are irrelevant
        var remainingContent = context.remainingContent.slice(0, i);
        var subresultContext = new Context(remainingContent);
        subresultContext.tokensByName = deepClone(context.tokensByName);
        var subresultMatch = dfs(subresultContext, subtokens);

        // If we matched
        if (subresultMatch) {
          // Attempt to match the remainder of the content with the same tokens
          var proposedContext = context.clone();
          proposedContext.tokensByName = subresultMatch.tokensByName;
          proposedContext.addStr(subresultMatch.completedContent);
          var resultContext = dfs(proposedContext, tokens.slice(1));

          // If we fully matched, return the result
          if (resultContext) {
            return resultContext;
          }
        }
      }

      // If no matches were found, return null
      return null;
    // Otherwise, return the result of remaining tokens
    } else {
      var proposedContext = context.clone();
      return dfs(proposedContext, tokens.slice(1));
    }
  // Otherwise, attempt to explore our scenario
  } else {
    // For each variants of the remaining string
    var i = context.remainingContent.length;
    for (; i > 0; i -= 1) {
      // Attempt to use the inverted as `false` for the `subtokens`
      // DEV: We use the same scope as the parent because tokens inner-tokens are irrelevant
      var remainingContent = context.remainingContent.slice(0, i);
      var subresultContext = new Context(remainingContent);
      subresultContext.tokensByName = deepClone(context.tokensByName);
      subresultContext.setToken(name, false);
      var subresultMatch = dfs(subresultContext, subtokens);

      // If we matched
      if (subresultMatch) {
        // Attempt to match the remainder of the content with the same tokens
        var proposedContext = context.clone();
        proposedContext.tokensByName = subresultMatch.tokensByName;
        proposedContext.addStr(subresultMatch.completedContent);
        var resultContext = dfs(proposedContext, tokens.slice(1));

        // If we fully matched, return the result
        if (resultContext) {
          return resultContext;
        }
      }
    }

    // Otherwise, return the result of `true`
    var proposedContext = context.clone();
    proposedContext.setToken(name, true);
    return dfs(proposedContext, tokens.slice(1));
  }
};
