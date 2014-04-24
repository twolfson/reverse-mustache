var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with alternative tags', function () {
  describe('when reversed', function () {
    reverseMustacheUtils.save({
      template: 'hello <%=place%>',
      content: 'hello moon',
      tags: ['<%=', '%>']
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'moon'});
    });
  });
});
