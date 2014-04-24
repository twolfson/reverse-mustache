var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with an terminal inverted token', function () {
  // TODO: Test inline variables
  describe('when reversed with matching content (boolean false)', function () {
    reverseMustacheUtils.save({
      template: 'hello{{^world}} moon{{/world}}',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: false});
    });
  });

  describe('when reversed with matching content (boolean true)', function () {
    reverseMustacheUtils.save({
      template: 'hello{{^world}} moon{{/world}}',
      content: 'hello'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: true});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{^world}}moon{{/world}}',
      content: 'hello there'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});

// TODO: Test nested content

// TODO: We probably need some tests with inverted and other scenarios

// TODO: We need to test variable re-use

// TODO: Need test for backoff (when we are in false and it is too greedy)
