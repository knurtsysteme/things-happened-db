// division-by-zero-test.js

var vows = require('vows');
var assert = require('assert');
var tools = require(__dirname + '/utils/rest.js');
var specs = require(__dirname + '/utils/defaultspecs.js');

// Create a Test Suite
vows.describe('bug 1409070735: Things may have a criteria and a state:').addBatch({
  'Insert me to men laughed and cried and insert another person laughed and request a Daniel laughed' : {
    topic : function() {
      var self = this;
      var person = {
        firstname : 'Daniel',
        lastname : 'Oltmanns',
        _secret : '1409070735' + new Date().getTime()
      };
      tools.postRequest('addto/men/laughed.json', person, function() {
        tools.postRequest('addto/men/cried.json', person, function() {
          person.firstname = 'Dirk';
          tools.postRequest('addto/men/laughed.json', person, function() {
            tools.getRequest('get/men/laughed.json', self.callback, {
              firstname : "Daniel",
              _secret : person._secret
            });
          });
        });

      });
    },
    'the response should' : {
      'have a http status 200' : specs.assertResponse.hasStatus200(),
      'be unique' : specs.assertResponse.json.hasLength(1),
      'have Daniel as firstname' : specs.assertResponse.json.key('firstname').hasValue('Daniel'),
      'have laughed as state' : specs.assertResponse.json.key('_state').hasValue('laughed'),
      'not have cried as state' : specs.assertResponse.json.key('_state').not.hasValue('cried')
    }
  }
}).exportTo(module); // Run it
