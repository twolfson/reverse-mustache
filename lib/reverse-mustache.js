// Load in library dependencies
var assert = require('assert');
var mustache = require('mustache');
var deepClone = require('clone');

// TODO: We should still probably draw out an automata diagram
// But... let's re-invent regular expressions with booleans

// TODO: We probably want one of these http://en.wikipedia.org/wiki/Backtracking

// This says depth first traversal. Let's do that and aim for the first working solution.

// TODO: Since mustache is ambiguous, we should require a schema to get our feet off the ground. It will significantly help with nested info
// DEV: If we were to use regular expressions, we would lose accuracy of re-using variable values

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
function Context(content, parentContext) {
  // Set up content and token internals
  this.originalContent = content;
  this.remainingContent = content || '';
  this.completedContent = '';
  this.tokensByName = {};
  this.parentContext = parentContext;
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

  // Retrieve a token from our context (or parent context chain)
  // TODO: Is parentContext a necessary idea?
  getToken: function (key) {
    var val = this.tokensByName[key];
    if (val === undefined && this.parentContext) {
      val = this.parentContext.getToken(key);
    }
    return val;
  },

  // Update a token on the context
  setToken: function (key, val) {
    // Assert the token is not yet set
    // DEV: Even if they are the same, we are missing an optimization by reusing that knowledge
    assert.strictEqual(this.tokensByName.hasOwnProperty(key), false, '`Context#setToken` expected `tokensByName["' + key + '"]` to not be defined but it was.');

    // Set the value
    this.tokensByName[key] = val;
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
  function dfs(content, tokens, parentContext) {
    var token = tokens[0];

    // TODO: We should be re-using tokensByName from top-levels (via deep clone)
    // TODO: Figure out how the hell to deal with subpaths (maybe getval, setval)
    // TODO: We are going to need to use sub-tokensByName as with mustache. Maybe re-use their lookup tooling?
    var context = new Context(content, parentContext);

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
        var val = context.getToken(name);
        console.log('hai', val);
        if (val !== undefined) {
            // Explore the tokens within our conditional
            // proposedContext.setToken(token[1], true);
            // proposedContext.addStr(subresultArr[0].completedContent);

            // var result = dfs(proposedContext.remainingContent, tokens.slice(1));

            // // If we matched
            // if (result) {
            //   // Accept proposed context, add our sub result, and return
            //   context = proposedContext;
            //   context.addContext(result);
            //   return context;
            // }

          // TODO: Attempt to use it
            // TODO: If it cannot be used, reject it.
        }

        // Match internal content as many times as possible
        var subtokens = token[4];
        var loopContext = context.clone();
        var subresultArr = [];
        while (true) {
          // Attempt to match the content again
          // DEV: We do not set the variable value here to allow inner-loops to extend as far as they can then cut back when forcing values later on
          // TODO: Don't forget that this runs in its own sub-object context (yey)
          var subresult = dfs(loopContext.remainingContent, subtokens);

          // If we could not match, stop looping
          if (!subresult) {
            break;
          }

          // Otherwise, save the loop context result
          loopContext.addContext(subresult);
          subresultArr.push(loopContext);

          // Break the context reference to avoid alteration to stored result
          loopContext = loopContext.clone();
        }

        // If the content matched, attempt to save our boolean as true
        // DEV: We make this as an attempt because future content could be invalid
        if (subresultArr.length) {
          // If there was one item, attempt to save as `true`
          // TODO: This could shift based on any `object` references to `name`
          if (subresultArr.length === 1) {
            // Set up exploratory case for conditional being true
            // TODO: The value could still be an object, not necessarily `true`.
            var proposedContext = context.clone();
            proposedContext.setToken(token[1], true);
            proposedContext.addStr(subresultArr[0].completedContent);

            // Explore the tokens within our conditional
            var result = dfs(proposedContext.remainingContent, tokens.slice(1));

            // If we matched
            if (result) {
              // Accept proposed context, add our sub result, and return
              context = proposedContext;
              context.addContext(result);
              return context;
            }
          // Otherwise, assume it was an array
          } else {
            // Attempt to use the entire array but progressively backoff
            var i = subresultArr.length;
            for (; i >= 0; i -= 1) {
              // TODO: We are currently creating a placeholder array of `true` values. Please stop doing this.
              var proposedContext = context.clone();
              proposedContext.setToken(token[1], subresultArr.slice(0, i).map(function () { return true; }));
              proposedContext.addStr(subresultArr[i - 1].completedContent);

              // Explore the tokens within our conditional
              var result = dfs(proposedContext.remainingContent, tokens.slice(1));

              // If we matched
              if (result) {
                // Accept proposed context, add our sub result, and return
                context = proposedContext;
                context.addContext(result);
                return context;
              }
            }
          }

          // Otherwise, continue to false
        }

        // Mark the boolean as false
        // DEV: This will fail on future steps if it is not `false` either
        context.setToken(token[1], false);
        var result = dfs(context.remainingContent, tokens.slice(1));

        // If there was a result, inherit and return
        // TODO: We need to do this for all of our inheritance, is there a pattern for this?
        if (result) {
          context.addContext(result);
          return context;
        // Otherwise, return null
        } else {
          return null;
        }
      case '&': // Unescaped variable
      case 'name': // Escaped variable
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
          proposedContext.setToken(token[1], proposedTokenVal);

          // Continue with the match attempt
          proposedContext.addStr(proposedStr);
          var proposedResult = dfs(proposedContext.remainingContent, tokens.slice(1));

          // If we matched successfully, use the proposed result and context
          // DEV: If we ever do a `matchAll` method, this will make every other action run `n` times (i.e. n^m runtime, n = characters, m = decisions)
          if (proposedResult) {
            context = proposedContext;
            context.addContext(proposedResult);
            return context;
          // Otherwise, continue
          } else {
            continue;
          }
        }
        break;
      case 'text': // Text
        // Slice the next snippet of text
        var expectedText = token[1];
        var actualText = context.remainingContent.slice(0, expectedText.length);

        // If it does not match, reject it
        if (actualText !== expectedText) {
          // TODO: This shouldn't be a return but walk back in `for` loop for previous decisions (e.g. `true` over `false`)
          return null;
        } else {
          context.addStr(expectedText);

          var result = dfs(context.remainingContent, tokens.slice(1));
          if (result) {
            context.addContext(result);
            return context;
          } else {
            return null;
          }
        }
        break;
      default:
        throw new Error('`reverseMustache` did not recognize type "' + type + '" for token ' + JSON.stringify(token));
    }
  }

  // Run our depth first traversal
  var result = dfs(content, ast);

  // If there was a result and there is remaining content, return negatively
  if (result && result.remainingContent !== '') {
    return null;
  // Otherwise, return the result
  } else {
    return result;
  }
}

// Export `reverseMustache` and `unescapeHtml`
reverseMustache.unescapeHtml = unescapeHtml;
module.exports = reverseMustache;
