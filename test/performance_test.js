// Load in dependencies
var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

// TODO: Add benchmark info
describe('A mustache template with a variable', function () {
  describe.skip('when reversing a very large content block', function () {
    // 50,000 a's (x2) is equivalent to a beautified http://nitevibe.com/
    // DEV: See https://gist.github.com/twolfson/11136618
    var lotsOfAs = new Array(3e4).join('a');
    reverseMustacheUtils.save({
      template: lotsOfAs + 'aa {{place}}' + lotsOfAs,
      content: lotsOfAs + 'aa moon' + lotsOfAs
    });
    // var regexp = new RegExp(lotsOfAs + 'aa (.*)' + lotsOfAs);
    // var match = (lotsOfAs + 'aa moon' + lotsOfAs).match(regexp);
    // console.log(match[1]);

    it.skip('is performant', function () {
      // Goal: Under 100ms (vs 1000ms for non-regexp)
    });
    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'moon'});
    });
  });

  describe.skip('when reversing a huge amount of content (over node\'s regexp limit)', function () {
    var lotsOfAs = new Array(5e4).join('a');
    it('returns meta information', function () {

    });
  });

  // TODO: Test that we use regexp escaping
});

describe.skip('A mustache template with a variable in a loop', function () {
  describe('when reversing a very large content block', function () {
    it('is performant', function () {
    });
    it('returns meta information', function () {
    });
  });
});
