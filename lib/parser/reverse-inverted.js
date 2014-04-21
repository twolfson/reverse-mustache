var Context = require('../context');

module.exports = function parserLoop (context, token, tokens, dfs) {
  // If we already have the value, use it
  var name = token[1];
  var val = context.getToken(name);
  if (val !== undefined) {
    return null;
  // Otherwise, attempt to explore our scenario
  } else {
    // TODO: Use backoff algorithm when we are using the subtokens
    return null;
  }
};
