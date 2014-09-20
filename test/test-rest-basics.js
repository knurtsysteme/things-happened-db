/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');

exports.selftest = function(test) {
  test.expect(1);
  test.ok(true);
  test.done();
};

exports.getHome = function(test) {
  tools.getRequest('', function(error, response, body) {
    test.expect(3);
    test.equals(response.headers['content-type'], 'text/html; charset=UTF-8');
    test.equals(response.statusCode, 200);
    test.ok(body);
    test.done();
  });
};
