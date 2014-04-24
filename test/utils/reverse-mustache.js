// Load in libarary
var expect = require('chai').expect;
var mustache = require('mustache');
var reverseMustache = require('../../');

// Define helper utilities
exports.save = function (params) {
  before(function callReverseMustache () {
    this.result = reverseMustache(params);

    // For behavioral sanity, verify `result + template` matches `content`
    if (this.result) {
      var actualOutput = mustache.render(params.template, this.result, params.partials);
      expect(actualOutput).to.equal(params.content);
    }
  });
  after(function cleanupResult () {
    delete this.result;
  });
};
