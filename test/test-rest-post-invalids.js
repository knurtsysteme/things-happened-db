/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var restrictions = require(__dirname + '/../config.json').app.restrictions;

exports.postEverything = function(test) {
  var data = {
    'foo' : 'bar'
  };
  var url = 'addto/everything/sheeted.json';
  tools.postRequest(url, data, function(error, response, body) {
    test.expect(1);
    test.equals(response.statusCode, 406);
    test.done();
  });
};
