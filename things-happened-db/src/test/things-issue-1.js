// division-by-zero-test.js

var vows = require('vows');
var assert = require('assert');
var tools = require(__dirname + '/utils/rest.js');
var specs = require(__dirname + '/utils/defaultspecs.js');

var unique = new Date().getTime() + '';
var mockThing = {
  title : 'foo',
  unique : unique,
  _host : 'noreply.foo',
  _version : '0.0.1',
  _cn : 'tests',
  _rid : '540b4eb5c5e' + unique,
  _pid : '540b4eb5c5e' + unique,
  _state : 'failed',
  _date : '20110920182821',
  _plausibility : 0,
  _reviewed : false,
  _branch : '0,2',
  _id : '541dab255f93796c746c8785'
};

// Create a Test Suite
vows.describe('bug: found root node of things with pid != null:').addBatch({
  'Insert a new state of a thing coming from another db' : {
    topic : function() {
      var self = this;
      tools.postRequest('addto/houses/built.json', mockThing, function() {
        tools.getRequest('get/houses/built.json', self.callback, {
          unique : unique
        });
      });
    },
    'the response should' : {
      'exist' : function(response) {
        assert.isTrue(JSON.parse(response.body).length == 1);
      },
      'have the new _host' : specs.assertResponse.json.key('_host').hasValue('localhost'),
      'have a new _version' : specs.assertResponse.json.key('_version').not.hasValue(mockThing._version),
      'have the new _cn' : specs.assertResponse.json.key('_cn').hasValue('houses'),
      'have a new _rid' : specs.assertResponse.json.key('_rid').not.hasValue(mockThing._rid),
      'have no _pid' : specs.assertResponse.json.key('_pid').isNull(),
      'have a new _date' : specs.assertResponse.json.key('_date').not.hasValue(mockThing._date),
      'have the new _branch' : specs.assertResponse.json.key('_branch').hasValue('0'),
      'have a new _id' : specs.assertResponse.json.key('_id').not.hasValue(mockThing._id)
    }
  }
}).exportTo(module); // Run it
