// Load in library
var expect = require('chai').expect;
var mustache = require('mustache');
var reverseMustache = require('../');

// Define helper utilities
var reverseMustacheUtils = {
  save: function (params) {
    before(function callReverseMustache () {
      this.result = reverseMustache(params);

      // For behavioral sanity, verify `result + template` matches `content`
      if (this.result) {
        var actualOutput = mustache.render(params.template, this.result.tokensByName);
        expect(actualOutput).to.equal(params.content);
      }
    });
    after(function cleanupResult () {
      delete this.result;
    });
  }
};

// TODO: Embrace the same flat file mantra as mustache.js
// TODO: We should be able to reverse the mustache test suite

describe('A mustache template without any mustache tokens', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello moon',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.be.an('object');
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello world',
      content: 'hello moon'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});

describe('A mustache template with a terminating conditional token', function () {
  describe('when reversed with matching content (boolean true)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#world}}moon{{/world}}',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({world: true});
    });
  });

  describe('when reversed with matching content (boolean false)', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#world}} moon{{/world}}',
      content: 'hello'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({world: false});
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
      expect(this.result.tokensByName).to.deep.equal({world: true});
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
      expect(this.result.tokensByName).to.deep.equal({world: false});
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

describe('A mustache template with a variable', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}}',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({place: 'moon'});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}}',
      content: 'hello'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});

describe('A mustache template with an inline variable', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{where}}moon',
      content: 'hello there moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({where: 'there '});
    });
  });

  describe('when reversed with matching content (empty string var)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{where}}moon',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({where: ''});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{where}}moon',
      content: 'hello mooon'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});

describe('A mustache template with an escaped variable', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{operator}} moon',
      content: 'hello &gt; moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({operator: '>'});
    });
  });
});

describe('A mustache template with an unescaped variable', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{{operator}}} moon',
      content: 'hello &gt; moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.deep.equal({operator: '&gt;'});
    });
  });
});

describe('A mustache template with an array loop', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#places}} moon{{/places}}',
      content: 'hello moon moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.have.property('places');
      expect(this.result.tokensByName.places).to.have.property('length', 2);
    });
  });

  describe('when reversed with too greedy matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#places}} moon{{/places}} moon',
      content: 'hello moon moon moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result.tokensByName).to.have.property('places');
      expect(this.result.tokensByName.places).to.have.property('length', 2);
    });
  });
});

// DEV: These test that we attempt to use the current value instead of overwriting it
describe('A mustache template with re-used variables', function () {
  describe.skip('when reversed with contradicting content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}} {{place}}',
      content: 'hello world moon'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.equal(null);
    });
  });

  describe.only('when reversed with contradicting conditionals', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#place}} world{{/place}}{{#place}} moon{{/place}}',
      content: 'hello world moon'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.equal(null);
    });
  });

  describe.skip('when reversed with a contradicting inner loop', function () {
    // Since we double loop, the only valid  `world` counts are squares
    reverseMustacheUtils.save({
      template: 'hello{{#places}}{{#places}} world{{/places}}{{/places}}',
      content: 'hello world world'
    });

    it('recognizes the contradiction and does not match', function () {
      expect(this.result).to.equal(null);
    });
  });
});
