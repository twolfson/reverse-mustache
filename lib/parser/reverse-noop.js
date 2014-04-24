var Context = require('../context');

module.exports = function parserNoop (context, token, tokens, dfs) {
  var proposedContext = context.clone();
  var resultContext = dfs(proposedContext, tokens.slice(1));
  return resultContext;
};
