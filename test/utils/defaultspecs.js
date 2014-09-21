var assert = require('assert');

// assertions free helper
var helper = {};
/**
 * subject to test. may is an object or an array of objects.
 */
helper.subject = function(subject) {
  return {
    /**
     * key of subject ...
     */
    key : function(key) {
      return {
        /**
         * return true, if the key exists in subject
         */
        exists : function() {
          var result = false;
          if (Array.isArray(subject)) {
            subject.forEach(function(element) {
              if (typeof element[key] != 'undefined')
                result = true;
            });
          } else {
            if (typeof subject[key] != 'undefined')
              result = true;
          }
          return result;
        },
        isNull : function() {
          return subject[key] == null
        },
        /**
         * return true, if the key equals the given value.
         */
        hasValue : function(value) {
          var objectHasValue = function(object) {
            return helper.subject(object).key(key).exists() && object[key] == value;
          }
          var result = false;
          if (Array.isArray(subject)) {
            for (var i = 0; i < subject.length; i++) {
              if (objectHasValue(subject[i])) {
                result = true;
                break;
              }
            }
          } else {
            result = objectHasValue(subject);
          }
          return result;
        }
      }
    }
  }
};

var assertResponse = {};
assertResponse.hasStatus = function(code) {
  return function(response) {
    assert.equal(response.statusCode, code);
  };
};
assertResponse.hasStatus200 = function() {
  return assertResponse.hasStatus(200);
};
assertResponse.json = {};
assertResponse.json.isOk = function() {
  return assertResponse.json.key('_ok').hasValue(1);
};
assertResponse.json.hasLength = function(length) {
  return function(response) {
    var json = JSON.parse(response.body);
    assert.isArray(json);
    assert.equal(json.length, length);
  }
};
assertResponse.json.key = function(key) {
  var result = {};
  result.exists = function() {
    return function(response) {
      var json = JSON.parse(response.body);
      assert.isTrue(helper.subject(json).key(key).exists());
    };
  };
  result.isNull = function() {
    return function(response) {
      var json = JSON.parse(response.body);
      assert.isTrue(helper.subject(json).key(key).isNull());
    }
  },
  result.hasValue = function(value) {
    return function(response) {
      var json = JSON.parse(response.body);
      assert.isTrue(helper.subject(json).key(key).hasValue(value));
    }
  };
  result.not = {};
  result.not.exists = function() {
    return function(response) {
      var json = JSON.parse(response.body);
      assert.isFalse(helper.subject(json).key(key).exists());
    }
  };
  result.not.hasValue = function(value) {
    return function(response) {
      var json = JSON.parse(response.body);
      assert.isFalse(helper.subject(json).key(key).hasValue(value));
    }
  };
  return result;
};

exports.assertResponse = assertResponse;
