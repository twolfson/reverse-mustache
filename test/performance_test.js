// Load in dependencies
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a variable', function () {
  describe('when reversing a very large content block', function () {
    var lotsOfAs = new Array(9001).join('a');
    reverseMustacheUtils.save({
      template: 'aa {{place}}' + lotsOfAs,
      content: 'aa moon' + lotsOfAs
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'moon'});
    });
  });
});
