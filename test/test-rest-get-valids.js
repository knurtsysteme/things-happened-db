/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var assertion = require(__dirname + '/utils/assertion.js');

exports.unknownThingsHappened = function(test) {
  tools.getRequest('get/notthings/nothappened.json', assertion.isEmptyArray(test));
};

exports.getCn = function(test) {
  tools.getRequest('get/things.json', function(error, response, cns) {
    test.expect(4);
    test.equals(response.headers['content-type'], 'application/json; charset=UTF-8');
    test.equals(response.statusCode, 200);
    test.ok(cns);
    test.ok(cns.indexOf('diseases') >= 0);
    test.done();
  });
};

exports.getAllDiseasesHailed = function(test) {
  var testfunc = function(error, response, diseases) {
    var nothingButDiseases = true;
    var nothingButHailed = true;
    test.expect(4);
    test.ok(diseases.length > 0);
    test.equals(diseases[diseases.length - 1].symptoms[0], 'mmpf');
    for ( var i in diseases) {
      if (diseases[i]._cn != 'diseases') {
        nothingButDiseases = false;
      }
    }
    test.ok(nothingButDiseases);
    for ( var i in diseases) {
      if (diseases[i]._state != 'hailed') {
        nothingButHailed = false;
      }
    }
    test.ok(nothingButHailed);
    test.done();
  };
  tools.withDiseasesHailed(testfunc, true);
};
exports.getDiseaseWithId = function(test) {
  var disease = null;
  var gotTheDisease = function(error, response, diseases) {
    test.expect(3);
    test.ok(diseases);
    test.equals(1, diseases.length);
    test.equals(JSON.stringify(disease), JSON.stringify(diseases[0]));
    test.done();
  };
  var getDiseaseWithIdAndTest = function(error, response, diseases) {
    disease = diseases[0];
    var criteria = {};
    criteria._id = disease._id + '';
    tools.getRequest('get/diseases.json', gotTheDisease, criteria);
  };
  tools.withDiseasesHailed(getDiseaseWithIdAndTest, true);
};
exports.getDiseasesWithIndividualQuery = function(test) {
  var daterow = require('heinzelmann').util('common-date-format').getRow();
  var testkey = daterow + 'key';
  var testvalue = daterow + 'value';
  var data = {};
  data.foo = 'foo';
  data.bar = 'bar';
  data[testkey] = testvalue;
  var url = 'addto/diseases/hailed.json';
  var testpost = function(error, response, postjson) {
    var getjson = function(error, response, diseases) {
      test.expect(5);
      test.equals(postjson._ok, 1);
      test.equals('foo', diseases[0].foo);
      test.equals(testvalue, diseases[0][testkey]);
      test.equals(diseases.length, 1);
      test.equals(diseases[0].bar + '', 'undefined');
      test.done();
    };
    var criteria = {};
    criteria[testkey] = testvalue;
    var projection = {};
    projection[testkey] = 1;
    projection['foo'] = 1;
    tools.getRequest('get/diseases.json', getjson, criteria, projection);
  };
  tools.postRequest(url, data, testpost);
};

exports.getAllDiseases = function(test) {
  var testfunc = function(error, response, json) {
    test.expect(1);
    test.ok(json.length > 0);
    test.done();
  };
  tools.getRequest('get/diseases.json', testfunc);
};
