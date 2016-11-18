// Load in library dependencies
var assert = require('assert');
var deepClone = require('clone');
var pathval = require('pathval');

// Helper for managing variables and content
function Context(content) {
  // Set up content and token internals
  this.originalContent = content;
  this.remainingContent = content || '';
  this.completedContent = '';
  this.tokensByName = {};
}
Context.prototype = {
  canAddStr: function (str) {
    var expectedStr = this.remainingContent.slice(0, str.length);
    return str === expectedStr;
  },

  // Add a new string to the context
  addStr: function (str) {
    // Assert we are not adding in content that is unwanted
    var expectedStr = this.remainingContent.slice(0, str.length);
    assert.strictEqual(str, expectedStr, '`Context#addStr` received bad match for `remainingContent`. Expected: "' + expectedStr + '", Actual: "' + str + '"');

    // Update remaining and completed content
    this.remainingContent = this.remainingContent.slice(str.length);
    this.completedContent += str;
  },

  // Retrieve a token from our context
  getToken: function (key) {
    // We cannot use `pathval` for getting `.`
    if (key === '.') {
      return this.tokensByName['.'];
    } else {
      return pathval.get(this.tokensByName, key);
    }
  },

  // Update a token on the context
  setToken: function (key, val, silent) {
    // Assert the token is not yet set
    // DEV: Even if they are the same, we are missing an optimization by reusing that knowledge
    if (!silent) {
      var currentVal = this.getToken(key);
      assert.strictEqual(currentVal, undefined, '`Context#setToken` expected `tokensByName["' + key + '"]` to not be defined but it was.');
    }

    // Set the value (including nested paths, `hello.world`)
    if (key === '.') {
      // We cannot use `pathval` for setting `.`
      this.tokensByName['.'] = val;
    } else {
      pathval.set(this.tokensByName, key, val);
    }
  },

  // Duplicate context (useful for exploring potential subcases)
  clone: function () {
    var context = new Context(this.originalContent);
    context.remainingContent = this.remainingContent;
    context.completedContent = this.completedContent;
    context.tokensByName = deepClone(this.tokensByName);
    return context;
  },

  // Add results from another context (e.g. subcases)
  addContext: function (context) {
    // Assert the context is not null
    assert(context, '`Context#addContext` received `null`, this is probably due to a bad check of `result` being truthy for inheritance.');

    // Add the content
    this.addStr(context.completedContent);

    // Copy over tokens
    var tokenNames = Object.getOwnPropertyNames(context.tokensByName);
    var i = 0;
    var len = tokenNames.length;
    for (; i < len; i++) {
      var tokenName = tokenNames[i];
      this.setToken(tokenName, context.tokensByName[tokenName]);
    }
  }
};

module.exports = Context;
