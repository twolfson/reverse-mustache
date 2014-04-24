var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a comment tokens', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello{{!moon}}',
      content: 'hello'
    });

    it('is ignored and we receive meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.be.an('object');
    });
  });
});
