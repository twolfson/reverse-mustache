// Load in library
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

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
