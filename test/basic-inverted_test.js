var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a terminal inverted token', function () {
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

describe('A mustache template with an inline inverted token', function () {
  describe('when reversed with matching content (boolean false)', function () {
    reverseMustacheUtils.save({
      template: 'hello{{^world}} moon{{/world}} wat',
      content: 'hello moon wat'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: false});
    });
  });

  describe('when reversed with matching content (boolean true)', function () {
    reverseMustacheUtils.save({
      template: 'hello{{^world}} moon{{/world}} wat',
      content: 'hello wat'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: true});
    });
  });
});

// TODO: Test inline variables

// TODO: Test nested content

// TODO: We probably need some tests with inverted combined with other scenarios

// TODO: We need to test variable re-use
