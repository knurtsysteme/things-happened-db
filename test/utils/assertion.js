/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

exports.isError = function(test) {
  return function(error, response, body) {
    test.expect(3);
    test.ok(body._ok < 0);
    test.ok(body._err);
    test.notEqual(response.statusCode, 200);
    test.done();
  };
};

exports.isEmptyArray = function(test) {
  return function(error, response, body) {
    test.expect(2);
    test.equal(response.statusCode, 200);
    test.equal(JSON.stringify(body), JSON.stringify([]));
    test.done();
  };
};

exports.keysValues = function(test, assertionObject) {
  return function(err, result) {
    var keysRes = Object.keys(result);
    var keysAss = Object.keys(assertionObject);
    test.expect(keysAss.length * 2);
    for ( var i in keysAss) {
      test.ok(keysRes.indexOf(keysAss[i]) >= 0, 'result object does not have key ' + keysAss[i]);
      var valueRes = result[keysAss[i]];
      var valueAss = assertionObject[keysAss[i]];
      test.equal(valueRes, valueAss, 'different values for ' + keysAss[i] + ': ' + valueRes + ' == ' + valueAss);
    }
    test.done();
  };
};
