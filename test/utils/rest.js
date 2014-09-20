/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var config = require(__dirname + '/../../config.json');
var baseurl = 'http://' + config.server.host + ':' + config.server.port + '/';

var getJSONFromResponse = function(body) {
  // callbackName = callbackName || 'jsonpcallback';
  // result = body.substr(callbackName.length + 1);
  // result = result.substr(0, result.length -1);
  try {
    return JSON.parse(body);
  } catch (e) {
    return body;
  }
};

exports.getDependencyObject = function(obj1, obj2) {
  return {
    id1 : obj1._id,
    id2 : obj2._id,
    cn1 : obj1._cn,
    cn2 : obj2._cn
  };
};

exports.postRequest = function(url, data, testfunc) {
  testfunc = testfunc || function() {
  };
  var request = require('request');
  request.post({
    url : baseurl + url,
    headers : {
      'content-type' : 'application/x-www-form-urlencoded'
    },
    body : require('querystring').stringify(data)
  }, function(error, response, body) {
    var json = getJSONFromResponse(body);
    testfunc(error, response, json);
  });
};

// FIXME requesting ('/get/foo/bar.json?nono=yesno', {foo:'bar')) won't work
exports.getRequest = function(url, testfunc, criteria, projection) {
  var options = {};
  var urlQuery = '';
  if (criteria || projection) {
    urlQuery = '?';
    if (criteria) {
      urlQuery += 'criteria=' + JSON.stringify(criteria);
    }
    if (criteria && projection) {
      urlQuery += '&';
    }
    if (projection) {
      urlQuery += 'projection=' + JSON.stringify(projection);
    }
  }
  options.url = baseurl + url + urlQuery;
  var request = require('request');
  request.get(options, function(error, response, body) {
    var json = getJSONFromResponse(body);
    testfunc(error, response, json);
  });
};
exports.withDiseasesHailed = function(callback, useCriteria) {
  var criteria = false;
  if (useCriteria) {
    criteria = {
      symptoms : {
        $exists : true
      },
      location : 'there',
      food : {
        $exists : true
      }
    };

  }
  this.getRequest('get/diseases/hailed.json', callback, criteria);
};
exports.withAllDiseases = function(callback) {
  this.getRequest('get/diseases.json', callback);
};

exports.postDefaultDiseaseHailed = function(callback) {
  var data = {
    "symptoms" : [ "mmpf", "uff", "argh" ],
    "location" : "there",
    "food" : [ "banana", "milk", "beer" ]
  };
  var url = 'addto/diseases/hailed.json';
  this.postRequest(url, data, callback);
};
