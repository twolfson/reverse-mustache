var Context = require('../context');

module.exports = function parserLoop (context, token, tokens, dfs) {
  // Slice the next snippet of text
  var expectedText = token[1];
  var actualText = context.remainingContent.slice(0, expectedText.length);

  // If it does not match, reject it
  if (actualText !== expectedText) {
    return null;
  // Otherwise, attempt to use it and pass it through
  } else {
    var proposedContext = context.clone();
    proposedContext.addStr(expectedText);

    var resultContext = dfs(proposedContext, tokens.slice(1));
    return resultContext;
  }
};
