var expect = require('chai').expect;
var reverseMustacheUtils = require('./utils/reverse-mustache');

describe('A mustache template with an nested inverted token', function () {
  describe('when reversed', function () {
    reverseMustacheUtils.save({
      template: 'hello {{^world.place}}moon{{/world.place}}',
      content: 'hello moon'
    });

    it('returns the nested object variable', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: {place: false}});
    });
  });
});

describe('A mustache template with an inverted token', function () {
  describe('when reversed with an inner variable', function () {
    reverseMustacheUtils.save({
      template: 'hello {{^world}}{{place}}{{/world}}',
      content: 'hello moon'
    });

    it('returns the inner variable at the outer level', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: false, place: 'moon'});
    });
  });
});

describe('A mustache template with an inverted token', function () {
  describe('when reversed with with greedy content', function () {
    reverseMustacheUtils.save({
      template: 'hello {{^world}}{{place}}{{/world}} moon',
      content: 'hello moon moon'
    });

    it('returns meta information', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({world: false, place: 'moon'});
    });
  });
});

describe('A mustache template with an inverted token and an existing variable', function () {
  describe('when the inverted token comes first', function () {
    reverseMustacheUtils.save({
      template: '{{^empty}}empty{{/empty}} string is {{empty}}empty',
      content: 'empty string is empty'
    });

    it('the inverted token uses the variable', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({empty: ''});
    });
  });

  describe('when the inverted token comes last', function () {
    reverseMustacheUtils.save({
      template: 'empty{{empty}} string is {{^empty}}empty{{/empty}}',
      content: 'empty string is empty'
    });

    it('the existing variable uses it', function () {
      expect(this.result).to.not.equal(null);
      expect(this.result).to.deep.equal({empty: ''});
    });
  });
});
