// Load in library
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with variables in its loop', function () {
  // TODO: There is no inheritance from inner loop to outer loop, we need to add that
  // TODO: When we introduce this inheritance, we need to *not* set `true` for the original token becuase it will be applying under the namespace of the current item (or will it?) =_= -- {{#place}}{{name}}{{/place}} (was `name` global or `place.name`)?
  // DEV: We are skipping this since it conflicts with `{{#place}}{{name}}{{/place}}` as it is impossible to tell whether `name` was a property of `place` or if `name` is a global
  // TODO: This can be resolved via a `schema` or variable type hinting but that is not as elegant
  describe.skip('using the outer context', function () {
    describe('when reversed', function () {
      reverseMustacheUtils.save({
        template: '{{#place}}{{place.name}}{{/place}}',
        content: 'world'
      });

      it('returns the original input', function () {
        expect(this.result).to.not.equal(null);
        expect(this.result).to.deep.equal({place: {name: 'world'}});
      });
    });
  });

  describe('using the loop variables context', function () {
    describe('when reversed', function () {
      reverseMustacheUtils.save({
        template: '{{#place}}{{name}}{{/place}}',
        content: 'world'
      });

      it('returns the original input', function () {
        expect(this.result).to.not.equal(null);
        expect(this.result).to.deep.equal({place: {name: 'world'}});
      });
    });
  });

  describe('using the dot notation context', function () {
    describe('when reversed', function () {
      reverseMustacheUtils.save({
        template: '{{#place}}{{.}}{{/place}}',
        content: 'world'
      });

      it('returns the original input', function () {
        expect(this.result).to.not.equal(null);
        expect(this.result).to.deep.equal({place: 'world'});
      });
    });
  });
});

describe('A non-terminal loop with variables', function () {
  describe('when reversed', function () {
    reverseMustacheUtils.save({
      template: '{{#place}}{{name}}{{/place}} world',
      content: 'world world'
    });

    it('returns the original input', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: {name: 'world'}});
    });
  });
});
