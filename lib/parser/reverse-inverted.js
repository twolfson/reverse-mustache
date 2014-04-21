var Context = require('../context');

module.exports = function parserLoop (context, token, tokens, dfs) {
  // If we already have the value, use it
  var name = token[1];
  var val = context.getToken(name);
  var subtokens = token[4];
  if (val !== undefined) {
    return null;
  // Otherwise, attempt to explore our scenario
  } else {
    // Attempt to use the inverted as `false`
    // DEV: We use the same scope as the parent because tokens inner-tokens are irrelevant
    var proposedContext = context.clone();
    proposedContext.setToken(name, false);

    // TODO: Use backoff algorithm when we are using the subtokens
    // Explore the subtoken values
    var proposedMatchContext = dfs(proposedContext, subtokens);
    if (proposedMatchContext) {
      // If we matched, return the result
      // TODO: We should be re-using the tokens from proposed match or something
      if (resultContext) {

      }
    }

    // Otherwise, return the result of `true`
    var proposedContext = context.clone();
    proposedContext.setToken(name, true);
    return dfs(proposedContext, tokens.slice(1));
  }
};
