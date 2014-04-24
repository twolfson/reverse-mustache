var Context = require('../context');

module.exports = function parserNoop (context, token, tokens, dfs) {
  var proposedContext = context.clone();
  var resultContext = dfs(proposedContext, tokens.slice(1));

  // If we matched but there is remaining context, return null
  if (resultContext && resultContext.remainingContent) {
    return null;
  // Otherwise, return null
  } else {
    return resultContext;
  }
};
