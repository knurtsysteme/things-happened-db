/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');

exports.postDiseaseNoticed = function(test) {
  var data = {
    "symptoms" : [ "ouch", "uff", "argh" ],
    "location" : "here"
  };
  var testfunc = function(error, response, json) {
    test.expect(8);
    test.equals(response.headers['content-type'], 'application/json; charset=UTF-8');
    test.equals(response.statusCode, 200);
    test.ok(json._ok);
    test.equals(typeof (json), 'object');
    test.ok(json.location);
    test.equals(json.location, 'here');
    test.equals(json.symptoms.length, 3);
    test.equals(json._ok, 1);
    test.done();
  };
  var url = 'addto/diseases/noticed.json';
  tools.postRequest(url, data, testfunc);
};

exports.postDiseaseWithQueryString = function(test) {
  var data = {
    "symptoms" : [ "ouch", "uff", "argh" ],
    "location" : "here"
  };
  var testfunc = function(error, response, json) {
    test.expect(8);
    test.equals(response.headers['content-type'], 'application/json; charset=UTF-8');
    test.equals(response.statusCode, 200);
    test.ok(json._ok);
    test.equals(typeof (json), 'object');
    test.ok(json.location);
    test.equals(json.location, 'here');
    test.equals(json.symptoms.length, 3);
    test.equals(json._ok, 1);
    test.done();
  };
  var url = 'addto/diseases/noticed.json?foo=bar';
  tools.postRequest(url, data, testfunc);
};

exports.postDiseaseHailed = function(test) {
  var testfunc = function(error, response, json) {
    test.expect(9);
    test.equals(response.headers['content-type'], 'application/json; charset=UTF-8');
    test.equals(response.statusCode, 200);
    test.ok(json);
    test.equals(typeof (json), 'object');
    test.ok(json.location);
    test.equals(json.location, "there");
    test.equals(json.symptoms.length, 3);
    test.equals(json.food.length, 3);
    test.equals(json._ok, 1);
    test.done();
  };
  tools.postDefaultDiseaseHailed(testfunc);
};
