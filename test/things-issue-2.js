// division-by-zero-test.js

var vows = require('vows');
var assert = require('assert');
var tools = require(__dirname + '/utils/rest.js');
var specs = require(__dirname + '/utils/defaultspecs.js');

// asserted values
var container = {};

// XXX could not reproduce the problem. maybe already fixed in a newer version.

// Create a Test Suite
vows.describe('bug: found node referencing parent of another tree:').addBatch({
  'when posting a new chair created and broken it afterwards' : {
    topic : function() {
      var self = this;
      tools.postRequest('addto/chairs/created.json', {
        by : 'Meister Eder'
      }, function(e, r, subject) {
        container.chairCreated = subject;
        tools.postRequest('addto/chairs/broken.json', {
          _id : subject._id,
          by : 'Pumuckl'
        }, function(e, r, subject) {
          container.chairBroken = subject;
          tools.postRequest('addto/chairs/repaired.json', {
            _id : subject._id,
            by : 'Meister Eder'
          }, function(e, r, subject) {
            container.chairRepaired = subject;
            self.callback();
          });
        });
      });

    },
    'both chairs should' : {
      'have the same _rid' : function() {
        assert.equal(container.chairCreated._rid, container.chairBroken._rid);
        assert.equal(container.chairRepaired._rid, container.chairBroken._rid);
        assert.equal(container.chairCreated._rid, container.chairRepaired._rid);
      }
    }
  }
}).exportTo(module); // Run it
