var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with an escaped variable', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{operator}} moon',
      content: 'hello &gt; moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({operator: '>'});
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
      expect(this.result).to.deep.equal({operator: '&gt;'});
    });
  });
});
