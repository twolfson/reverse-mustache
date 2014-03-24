// Load in library
var reverseMustache = require('../');

// Define helper utilities
var reverseMustacheUtils = {
  save: function (params) {
    before(function callReverseMustache () {
      this.result = reverseMustache(params);
    });
    after(function cleanupResult () {
      delete this.result;
    });
  }
};

// TODO: Embrace the same flat file mantra as mustache.js
// TODO: We should be able to reverse the mustache test suite

describe.skip('A mustache template without any mustache tokens', function () {
  describe('when reversed with matching content', function () {
    it('returns meta information', function () {

    });
  });

  describe.skip('when reversed with non-matching content', function () {
    it('returns `null`', function () {

    });
  });
});

describe('A mustache template with a conditional token', function () {
  describe('when reversed with matching content (boolean true)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}}moon{{/world}}',
      content: 'hello moon'
    });

    it('returns meta information', function () {

    });
  });

  describe.skip('when reversed with matching content (boolean false)', function () {
    it('returns meta information', function () {

    });
  });

  describe.skip('when reversed with non-matching content', function () {
    it('returns `null`', function () {

    });
  });
});
