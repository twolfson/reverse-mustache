// Load in library dependencies
var assert = require('assert');
var mustache = require('mustache');
var pathval = require('pathval');
var deepClone = require('clone');

// DEV: This is not a perfect backtrack engine, I wonder if this is more/less performant that one.
// DEV: If we were to use regular expressions, we would lose accuracy of re-using variable values (and potentially have contradictions)
// TODO: Can we break each of these recursive items into its own function? I ask because the function is getting large.

// Reverse HTML escapes
// https://github.com/janl/mustache.js/blob/0.8.1/mustache.js#L53-L66
var reverseEntityMap = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': '\'',
  '&#x2F;': '/'
};
var reverseEntityRegExp = /(&amp;|&lt;|&gt;|&quot;|&#39;|&#x2F;)/g;
function unescapeHtml(string) {
  return String(string).replace(reverseEntityRegExp, function (s) {
    return reverseEntityMap[s];
  });
}

// TODO: Instead of deep clone, consider prototypal lookup for tokens
function Context(content) {
  // Set up content and token internals
  this.originalContent = content;
  this.remainingContent = content || '';
  this.completedContent = '';
  this.tokensByName = {};
}
Context.prototype = {
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
  setToken: function (key, val) {
    // Assert the token is not yet set
    // DEV: Even if they are the same, we are missing an optimization by reusing that knowledge
    var currentVal = this.getToken(key);
    assert.strictEqual(currentVal, undefined, '`Context#setToken` expected `tokensByName["' + key + '"]` to not be defined but it was.');

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

// TODO: Should this be a new method of a mustache template?
function reverseMustache(params) {
  // Make assertions about parameters
  assert(params, '`reverseMustache` expects `params` to be provided');
  assert(params.template, '`reverseMustache` expects `params.template` to be provided');
  assert(params.content, '`reverseMustache` expects `params.content` to be provided');

  // Interpret and localize parameters
  var ast = mustache.parse(params.template);
  var content = params.content;

  // Define recursive function to perform depth-first traversal
  function dfs(context, tokens) {
    var token = tokens[0];

    // TODO: Figure out how the hell to deal with subpaths (maybe getval, setval)
    // TODO: We are going to need to use sub-tokensByName as with mustache. Maybe re-use their lookup tooling?

    // If there are no tokens left, return context
    // TODO: Is this the right thing to do?
    if (!token) {
      return context;
    }

    // Depending on the type of the token
    var type = token[0];
    var name = token[1];
    switch (type) {
      case '#': // If/loop
        // If we already have the value
        var subtokens = token[4];
        var subcontext = new Context(context.remainingContent);
        var val = context.getToken(name);
        if (val !== undefined) {
          // Explore the tokens within our conditional
          // TODO: This should be done by a method
          // DEV: Both `subcontext` and `proposedContext` already have the value set because they inherit it during cloning
          // TODO: Test `{{abc}} {{#abc}}{{.}}{{/abc}} world` on `world world world` to verify it can back-off greedy with pre-defined variables
          subcontext.tokensByName = deepClone(context.tokensByName);
          var subresultContext = dfs(subcontext, subtokens);

          // If we had no matches, return `null`
          if (!subresultContext) {
            return null;
          }

          // Otherwise, set up a context that uses our subcontext result
          var proposedContext = context.clone();
          proposedContext.addStr(subresultContext.completedContent);

          // Attempt to use it and result the result
          var resultContext = dfs(proposedContext, tokens.slice(1));
          return resultContext;
        }

        // TODO: `parentContext` only makes sense for the looping case
        // TODO: Every other `dfs` traversal should be using the same context as the original (but with a clone to prevent pollution)

        // Match internal content as many times as possible
        var subresultContextArr = [];
        while (true) {
          // Break the context reference to avoid alteration to stored result
          subcontext = subcontext.clone();

          // Attempt to match the content again
          // DEV: We do not set the variable value here to allow inner-loops to extend as far as they can then cut back when forcing values later on
          // TODO: Don't forget that this runs in its own sub-object context (yey)
          var subresultContext = dfs(subcontext, subtokens);

          // If we could not match, stop looping
          if (!subresultContext) {
            break;
          }

          // Otherwise, save the subresult context
          subresultContextArr.push(subresultContext);
          subcontext = subresultContext;
        }

        // If the content matched, attempt to save our boolean as true
        // DEV: We make this as an attempt because future content could be invalid
        if (subresultContextArr.length) {
          // Attempt to use the entire array but progressively backoff
          var i = subresultContextArr.length;
          for (; i > 0; i -= 1) {
            // Attempt to use the entire string but progressively backoff
            // TODO: This runtime is horrible; n^n if every character is a variable
            // DEV: We must do this in case of `{{#world}}{{hai}}{{/world}} hai`
            // TODO: If there are no variables in the loop, we can skip this (it must be the entirety)
            var subresultContext = subresultContextArr[i - 1];
            var j = subresultContext.completedContent.length;
            for (; j > 0; j -= 1) {
              // TODO: If we are on the total length, use `subresultContextArr[i]` for `matchContexts` as it is pre-calculated. Also, fix it first to match this pattern.

              // Match each loop iteration (the `token` loop, not these other 3 ones -_-)
              var remainingContent = subresultContext.completedContent.slice(0, j);
              var k = i - 1; // Offset by 1 so we can have k >= 0 which makes more sense in the array sense
              var matchContexts = [];
              for (; k >= 0; k -=1) {
                // Run the match
                var matchContext = new Context(remainingContent);
                var proposedMatchContext = dfs(matchContext, subtokens);

                // If we cannot match, break the loop
                if (!proposedMatchContext) {
                  break;
                // Otherwise, save the context and trim the remaining content
                } else {
                  // TODO: We will probably need to progressively back off here recursively as well. fuck.
                  // TODO: How do you back off the first variable but not the third? I don't think it is possible.
                  matchContexts.push(proposedMatchContext);
                  remainingContent = remainingContent.slice(proposedMatchContext.completedContent.length);
                }
              }

              // If we stopped early, continue
              if (matchContexts.length !== i) {
                continue;
              }

              // For each of our match contexts
              var proposedContext = context.clone();
              var proposedVal = matchContexts.map(function (matchContext) {
                // Save the amount of content they completed
                proposedContext.addStr(matchContext.completedContent);

                // Map the matches into their respective flavors (e.g. `object`, `.`, `true`)
                var tokensByName = matchContext.tokensByName;
                if (Object.getOwnPropertyNames(tokensByName).length) {
                  // If there is a `.` key, make that our return value
                  var retVal = tokensByName;
                  if (tokensByName['.'] !== undefined) {
                    retVal = tokensByName['.'];
                  }
                  return retVal;
                } else {
                  return true;
                }
              });

              // If there is only one item, go for lower common denominator
              // TODO: Is there a conflict between setting either `place[0]` vs `place` (maybe if someone has `[object Array]` -_-;;)
              if (i === 1) {
                proposedVal = proposedVal[0];
              }

              // Attempt to use our set of tokens on the remaining content
              proposedContext.setToken(name, proposedVal);
              var resultContext = dfs(proposedContext, tokens.slice(1));

              // If we matched, return
              if (resultContext) {
                return resultContext;
              }
            }
          }

          // Otherwise, continue to false
        }

        // Mark the boolean as false
        // DEV: This will fail on future steps if it is not `false` either
        var proposedContext = context.clone();
        proposedContext.setToken(name, false);
        var resultContext = dfs(proposedContext, tokens.slice(1));
        return resultContext;
      case '&': // Unescaped variable
      case 'name': // Escaped variable
        // If the variable is already defined
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
            proposedTokenVal = reverseMustache.unescapeHtml(proposedStr);
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
      case 'text': // Text
        // Slice the next snippet of text
        var expectedText = name;
        var actualText = context.remainingContent.slice(0, expectedText.length);

        // If it does not match, reject it
        if (actualText !== expectedText) {
          // TODO: This shouldn't be a return but walk back in `for` loop for previous decisions (e.g. `true` over `false`)
          return null;
        // Otherwise, attempt to use it and pass it through
        } else {
          var proposedContext = context.clone();
          proposedContext.addStr(expectedText);

          var resultContext = dfs(proposedContext, tokens.slice(1));
          return resultContext;
        }
        break;
      default:
        throw new Error('`reverseMustache` did not recognize type "' + type + '" for token ' + JSON.stringify(token));
    }
  }

  // Run our depth first traversal
  var context = new Context(content);
  var result = dfs(context, ast);

  // If there was a result and there is remaining content, return negatively
  if (result && result.remainingContent !== '') {
    return null;
  // Otherwise, return the result
  } else {
    // TODO: Move to `tokensByName` in a major release
    return result;
  }
}

// Export `reverseMustache` and `unescapeHtml`
reverseMustache.unescapeHtml = unescapeHtml;
module.exports = reverseMustache;
