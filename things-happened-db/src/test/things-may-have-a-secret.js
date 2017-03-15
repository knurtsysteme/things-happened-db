// division-by-zero-test.js

var vows = require('vows');
var assert = require('assert');
var tools = require(__dirname + '/utils/rest.js');
var specs = require(__dirname + '/utils/defaultspecs.js');

var topics = {};
topics.insertUniqueAndRequest = function() {
  var secret = 'a' + new Date().getTime();
  var self = this;
  var getBack = function() {
    var criteria = {};
    criteria._secret = secret;
    tools.getRequest('get/men.json', self.callback, criteria);
  };
  var data = {
    person : 'uniquePerson',
    _secret : secret
  };
  tools.postRequest('addto/men/drooledover.json', data, getBack);
};

// Create a Test Suite
vows.describe('Things may have a secret').addBatch({
  'when posting a fresh unique secret and requesting it afterwards' : {
    topic : topics.insertUniqueAndRequest,
    'the response should' : {
      'have a http status 200' : specs.assertResponse.hasStatus200(),
      'be unique' : specs.assertResponse.json.hasLength(1),
      'have the data' : specs.assertResponse.json.key('person').hasValue('uniquePerson'),
      'not contain the secret' : specs.assertResponse.json.key('_secret').not.exists()
    }
  },
  'when inserting a thing with a secret' : {
    topic : function() {
      var data = {
        person : 'me',
        _secret : '98js8fj98ow38jhoa8hfio78zlhi37h'
      };
      tools.postRequest('addto/men/drooledover.json', data, this.callback);
    },
    'the response should' : {
      'have a http status 200' : specs.assertResponse.hasStatus200(),
      'not contain the secret' : specs.assertResponse.json.key('_secret').not.exists(),
      'be _ok' : specs.assertResponse.json.isOk(),
      'have the data' : specs.assertResponse.json.key('person').hasValue('me')
    }
  }
}).exportTo(module); // Run it
