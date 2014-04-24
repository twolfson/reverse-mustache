var Context = require('../context');

// Load in larger modules
exports.reverseLoop = require('./reverse-loop');
exports.reverseInverted = require('./reverse-inverted');
exports.reverseVariable = require('./reverse-variable');

// Set up text and comment handling
exports._reverseStr = function parserStr (context, str, tokens, dfs) {
  // Slice the next snippet of text
  var expectedText = str;
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
exports.reverseText = function parserText (context, token, tokens, dfs) {
  return exports._reverseStr(context, token[1], tokens, dfs);
};
