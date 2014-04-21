// Load in library
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with an array loop', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#places}} moon{{/places}}',
      content: 'hello moon moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.have.property('places');
      expect(this.result.places).to.have.property('length', 2);
    });
  });

  describe('when reversed with too greedy matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello{{#places}} moon{{/places}} moon',
      content: 'hello moon moon moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.have.property('places');
      expect(this.result.places).to.have.property('length', 2);
    });
  });
});
