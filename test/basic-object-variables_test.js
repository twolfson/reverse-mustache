// Load in library
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with object variables', function () {
  describe('when reversed', function () {
    reverseMustacheUtils.save({
      template: '{{place.name}}',
      content: 'world'
    });

    it('returns the original input', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: {name: 'world'}});
    });
  });
});
