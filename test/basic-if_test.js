var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a terminating conditional token', function () {
  describe('when reversed with matching content (boolean true)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}}moon{{/world}}',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: true});
    });
  });

  describe('when reversed with matching content (boolean false)', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#world}} moon{{/world}}',
      content: 'hello'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: false});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}}moon{{/world}}',
      content: 'hello there'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});

describe('A mustache template with an inline conditional token', function () {
  describe('when reversed with matching content (boolean true)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}}there{{/world}} moon',
      content: 'hello there moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: true});
    });
  });

  // DEV: This is the first instance of where we need to backtrack
  describe('when reversed with matching content (boolean false)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}} there{{/world}}moon',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: false});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}}there{{/world}} moon',
      content: 'hello there'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});
