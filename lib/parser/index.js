module.exports = {
  reverseLoop: require('./reverse-loop'),
  reverseInverted: require('./reverse-inverted'),
  reverseVariable: require('./reverse-variable'),
  reverseText: require('./reverse-text')
};

exports.reverseNoop = function parserText (context, token, tokens, dfs) {
  var proposedContext = context.clone();
  var resultContext = dfs(proposedContext, tokens.slice(1));
  return resultContext;
};
