// Load in dependencies
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a variable', function () {
  describe('when reversing a very large content block', function () {
    // 50,000 a's (x2) is equivalent to a beautified http://nitevibe.com/
    // DEV: See https://gist.github.com/twolfson/11136618
    var lotsOfAs = new Array(5e4).join('a');
    reverseMustacheUtils.save({
      template: lotsOfAs + 'aa {{place}}' + lotsOfAs,
      content: lotsOfAs + 'aa moon' + lotsOfAs
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'moon'});
    });
  });
});
