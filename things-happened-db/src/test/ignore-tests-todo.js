/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var restrictions = require(__dirname + '/../config.json').app.restrictions;

exports.postDependencies = function(test) {
  var data = {
    'foo' : 'bar'
  };
  var url = 'addto/dependencies/sheeted.json';
  tools.postRequest(url, data, function(error, response, body) {
    test.expect(1);
    test.equals(response.statusCode, 406);
    test.done();
  }());
};

// TODO get
// http://localhost:3000/get/bananas.json?criteria={_id:%2253317c593e08f7ec16840bd9%22}
// /threw exception

exports.postUnderscoreAttribute = function(test) {
  var data = {
    '_foo' : 'bar'
  };
  var url = 'addto/trees/cut.json';
  tools.postRequest(url, data, function(error, response, body) {
    test.expect(1);
    test.equals(response.statusCode, 406);
    test.done();
  });
};

exports.postDeepObject = function(test) {
  var data = {
    something : {
      has : 'something else to be stored separatly'
    }
  };
  var url = 'addto/feet/smelling.json';
  tools.postRequest(url, data, function(error, response, body) {
    test.expect(1);
    test.equals(response.statusCode, 406);
    test.done();
  });
};

exports.postHugeObject = function(test) {
  var i = 0;
  var data = {};
  while (i <= restrictions.allowedKeySize) {
    data['key_' + i] = 'value #' + (++i);
  }
  var data = {
    something : {
      has : 'something else to be stored separatly'
    }
  };
  var url = 'addto/bananas/eaten.json';
  tools.postRequest(url, data, function(error, response, body) {
    test.expect(3);
    // error message is something like "your object is too huge, split it in
    // different objects .."
    test.ok(error.match(/.*huge.*/));
    test.ok(error.match(/.*split.*/));
    test.equals(response.statusCode, 406);
    test.done();
  });
};
