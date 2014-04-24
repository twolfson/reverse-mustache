// Load in library
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A template using both loop and inline variables', function () {
  describe('when loop precedes inline is reversed', function () {
    reverseMustacheUtils.save({
      template: '{{#place}}{{.}}{{/place}} {{place}}',
      content: 'world world'
    });

    it('returns the original input', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'world'});
    });
  });

  describe('when inline precedes loop is reversed', function () {
    reverseMustacheUtils.save({
      template: '{{place}} {{#place}}{{.}}{{/place}}',
      content: 'world world'
    });

    it('returns the original input', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'world'});
    });
  });

  // DEV: This tests that we can backoff with pre-defined variables
  describe('when inline precedes loop followed by constant is reversed', function () {
    reverseMustacheUtils.save({
      template: '{{place}} {{#place}}{{.}}{{/place}} world',
      content: 'world world world'
    });

    it('returns the original input', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'world'});
    });
  });

  // TODO: Enable and fix this https://github.com/twolfson/reverse-mustache/issues/4
  describe.skip('when an inline and loop share the same object but have different properties', function () {
    reverseMustacheUtils.save({
      template: '{{place.name}} {{#place}}{{id}}{{/place}}',
      content: 'world 1234'
    });

    it('extends the content', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: {name: 'world', id: '1234'}});
    });
  });
});

// DEV: These test that we attempt to use the current value instead of overwriting it
describe('A mustache template with re-used variables', function () {
  describe('when reversed with agreeing content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}} {{place}}',
      content: 'hello world world'
    });

    it('recognizes the variable and re-uses it during matching', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.have.property('place', 'world');
    });
  });

  describe('when reversed with contradicting content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}} {{place}}',
      content: 'hello world moon'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.equal(null);
    });
  });

  describe('when reversed with agreeing conditionals', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#place}} world{{/place}}{{#place}} world{{/place}}',
      content: 'hello world world'
    });

    it('matches the variable and re-uses it during matching', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.have.property('place', true);
    });
  });

  describe('when reversed with contradicting conditionals', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#place}} world{{/place}}{{#place}} world{{/place}}',
      content: 'hello world moon'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.equal(null);
    });
  });

  // DEV: These tests are irrelevant since we cannot distinguish outer context from inner context in loops
  /*
  describe('when reversed with a contradicting inner loop', function () {
    // Since we double loop, the only valid  `world` counts are squares
    reverseMustacheUtils.save({
      template: 'hello{{#places}}{{#places}} world{{/places}}{{/places}}',
      content: 'hello world world'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.equal(null);
    });
  });

  describe('when reversed with an agreeing inner loop', function () {
    // Since we double loop, the only valid  `world` counts are squares
    reverseMustacheUtils.save({
      template: 'hello{{#places}}{{#places}} world{{/places}}{{/places}}',
      content: 'hello world world world world'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.have.property('places');
      expect(this.result.places).to.have.property('length', 2);
    });
  });
  */
});
