/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var assertion = require(__dirname + '/utils/assertion.js');

exports.getCountOfDiseases = function(test) {
  var diseases = null;
  var testCount = function(error, response, count) {
    test.expect(2);
    test.ok(count);
    test.equals(diseases.length, count.result);
    test.done();
  };
  var storeDiseasesAndTestCount = function(error, response, response) {
    diseases = response;
    tools.getRequest('count/diseases.json', testCount);
  };
  tools.withAllDiseases(storeDiseasesAndTestCount);
};

exports.getCountOfDiseasesHailed = function(test) {
  var diseases = null;
  var testCount = function(error, response, count) {
    test.expect(2);
    test.ok(count);
    test.equals(diseases.length, count.result);
    test.done();
  };
  var storeDiseasesAndTestCount = function(error, response, response) {
    diseases = response;
    tools.getRequest('count/diseases/hailed.json', testCount);
  };
  tools.withDiseasesHailed(storeDiseasesAndTestCount);
};

exports.getCountOfThings = function(test) {
  var diseases = null;
  var testCount = function(error, response, count) {
    test.expect(2);
    test.ok(count);
    test.ok(diseases.length < count._total);
    test.done();
  };
  var storeDiseasesAndTestCount = function(error, response, response) {
    diseases = response;
    tools.getRequest('count/things.json', testCount);
  };
  tools.withAllDiseases(storeDiseasesAndTestCount);
};