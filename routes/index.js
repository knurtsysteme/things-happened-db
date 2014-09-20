/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var heinzelmann = require('heinzelmann');
var appConf = require(__dirname + '/../config.json');
var db = heinzelmann.util('mongo-factory', appConf.db.name).client();
var errorHandler = require(__dirname + '/error-handling.js');
var logger = require(__dirname + '/../logger');

db.open(function() {
});
var delegator = require('./CWBDao');
var dao = new delegator.CWBDao(db, appConf);

var ws = require(__dirname + '/../ws');
var sendInsertedThing = ws.sendInsertedThing;

var defaultResponse = function(request, error, result, response, callback) {
  result = result || {};
  // TODO put into error-handling.js
  if (error && !result._err) {
    result._err = error.message || error;
  }
  if (typeof result == 'object') {
    result._ok = result._err ? (result._ok < 0 ? result._ok : -1207171113) : 1;
  }
  if (result._secret) {
    delete result._secret;
  }
  heinzelmann.util('http-response', response).json(result);
  if (typeof callback == 'function') {
    callback(result);
  }
};

var responseEntries = function(request, response, criteria, projection) {
  var collectionName = request.params[0];
  dao.getEntries(collectionName, function(error, result) {
    defaultResponse(request, error, result, response);
  }, criteria, projection);
};

exports.response406 = function(request, response, message) {
  response.statusCode = 406;
  message = message || 'not acceptable request.';
  var error = {};
  error._err = message;
  heinzelmann.util('http-response', response).json(error);
};

exports.responseCurrentCollectionNames = function(request, response) {
  dao.getCurrentCollectionNames(function(error, result) {
    defaultResponse(request, error, result, response);
  });
};

exports.responseEntriesInCollection = function(request, response) {
  var criteria = request.query.criteria || {};
  var projection = request.query.projection || {};
  responseEntries(request, response, criteria, projection);
};
exports.responseEntriesWithState = function(request, response) {
  logger.error('not implemented yet');
};
exports.responseEntriesInCollectionWithState = function(request, response) {
  // request.query.criteria is readonly string but we have to add the state!
  // http://stackoverflow.com/questions/4968731/why-is-request-querystring-readonly
  var criteria = {
    _state : request.params[1]
  };
  if (request.query.criteria) {
    var objectCriteria = JSON.parse(request.query.criteria);
    criteria = require('util')._extend(criteria, objectCriteria);
  }
  var projection = request.query.projection || {};
  responseEntries(request, response, criteria, projection);
};

exports.responseUnknown = function(request, response) {
  response.statusCode = 400;
  var result = errorHandler.getErrorObject('unknown service', 1403161947);
  heinzelmann.util('http-response', response).json(result);
};
exports.responseWhatHappenedToThings = function(request, response) {
  var collectionName = request.params[0];
  dao.getCollection(collectionName).distinct('_state', {}, function(error, result) {
    defaultResponse(request, error, result.sort(), response);
  });
};
exports.responseCountOfCollectionEntries = function(request, response) {
  var collectionName = request.params[0];
  var state = request.params[1] || false;
  dao.getCountOfCollectionEntries(collectionName, state, function(error, result) {
    defaultResponse(request, error, result, response);
  });
};
exports.responseCountOfAllEntries = function(request, response) {
  dao.getCountOfAllEntries(function(error, result) {
    defaultResponse(request, error, result, response);
  });
};
exports.responseResultOfInsertion = function(request, response) {
  var collectionName = request.params[0];
  var state = request.params[1];
  var entry = request.body;
  dao.insert(collectionName, state, entry, function(error, result) {
    defaultResponse(request, error, result, response, sendInsertedThing);
  });
};

exports.responseResultOfDependencyInsertion = function(request, response) {
  var state = request.params[0];
  dao.addDependency(request.body, state, function(error, result) {
    defaultResponse(request, error, result, response, sendInsertedThing);
  });
};
