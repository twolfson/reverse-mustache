var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with a variable', function () {
  describe.only('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}}',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({place: 'moon'});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{place}}',
      content: 'hello'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});

describe('A mustache template with an inline variable', function () {
  describe('when reversed with matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{where}}moon',
      content: 'hello there moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({where: 'there '});
    });
  });

  describe('when reversed with matching content (empty string var)', function () {
    reverseMustacheUtils.save({
      template: 'hello {{where}}moon',
      content: 'hello moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({where: ''});
    });
  });

  describe('when reversed with non-matching content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{where}}moon',
      content: 'hello mooooooon'
    });

    it('returns `null`', function () {
      expect(this.result).to.equal(null);
    });
  });
});
