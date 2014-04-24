var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a partial token', function () {
  describe('when reversed', function () {
    reverseMustacheUtils.save({
      template: 'hello {{> place}}',
      content: 'hello moon',
      partials: {
        place: 'moon'
      }
    });

    it.only('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.be.an('object');
    });
  });

  describe('when reversed in a loop', function () {
    reverseMustacheUtils.save({
      template: 'hello {{#place}}{{> name}}{{/place}}',
      content: 'hello moon',
      partials: {
        place: '{{name}}'
      }
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: {name: 'moon'}});
    });
  });
});
