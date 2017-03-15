/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

/* 
 FIXME missing error handling in entire app (by fact, all possible errors are ignored)
 the user won't recognize some errors

 XXX der ganze käse geht auch cooler, funktionaler (siehe ThingsQuery oder test/utils/defaultspecs)
 */

var heinzelmann = require('heinzelmann');
var validator = require(__dirname + '/validator.js');
var errorHandler = require(__dirname + '/error-handling.js');

/**
 * all IO with mongo
 * 
 * @param db
 *          database used
 * @param appConf
 *          (optional, default ../config.json) application configuration (file
 * 
 * <pre>
 * config.json
 * </pre>)
 */
exports.CWBDao = function(db, appConf) {
  appConf = appConf || require(__dirname + '/../config.json');
  var ObjectID = require('mongodb').ObjectID;
  var self = this;
  var callbackError = function(message, id, callback) {
    callback(errorHandler.getErrorObject(message, id), null);
  };
  var callbackSuccess = function(result, callback) {
    callback(null, result);
  };

  /**
   * return array with all known collections
   * 
   * @param callback
   *          called on success
   */
  this.getCurrentCollectionNames = function(callback) {
    db.collectionNames(function(error, collections) {
      var result = [];
      for ( var i in collections) {
        var name = collections[i].name.substr(appConf.db.name.length + 1);
        if (name == 'system.indexes') {
          continue;
        }
        result.push(name);
      }
      if (error) {
        callbackError(error, 1403132050, callback);
      } else {
        result.sort();
        callbackSuccess(result, callback);
      }
    });
  };

  // TODO we have to limit it! .limit(?) inject limit
  /**
   * return entries exists in given collection with given criteria (optional)
   * and projection (optional).
   * 
   * delete _secret attribute (if exists)
   * 
   * @param collectionName
   *          to request
   * @param callback
   *          get parameter of mongo's toarray
   *          (http://mongodb.github.io/node-mongodb-native/markdown-docs/queries.html)
   * @param criteria
   *          (default no criteria - get all entries)
   * @param projection
   *          (default no projection - get all fields)
   */
  this.getEntries = function(collectionName, callback, criteria, projection) {
    var filteredCallback = function(err, results) {
      results.forEach(function(result) {
        delete result._secret;
        delete result._deleted;
      });
      callback(err, results);
    }
    projection = projection || {};
    criteria = getStringIdsAsObjectIds(criteria);
    if (criteria) {
      if (typeof projection == 'string') {
        projection = JSON.parse(projection);
      }
      criteria._deleted = false;
      db.collection(collectionName).find(criteria, projection).toArray(filteredCallback);
    } else {
      callbackError('invalid criteria', 1403261021, callback);
    }
  };

  var getStringIdsAsObjectIds = function(object) {
    var result = object || {};
    var setStringIdsAsObjectIdsForKey = function(key) {
      if (result[key]) {
        if (typeof result[key] == 'string') {
          try {
            result[key] = new ObjectID(result[key]);
          } catch (e) {
            result = false;
          }
        } else if (typeof result[key] == 'object') {
          try {
            var keys = Object.keys(result[key]);
            var i = keys.length;
            while (i--) {
              var key2 = keys[i];
              if (Array.isArray(result[key][key2])) {
                var j = result[key][key2].length;
                while (j--) {
                  result[key][key2][j] = new ObjectID(result[key][key2][j]);
                }
              }
            }
          } catch (e) {
            console.info(e);
            result = false;
          }
        }
      }
    }
    if (typeof result == 'string') {
      try {
        result = JSON.parse(result);
      } catch (e) {
        result = false;
      }
    }

    setStringIdsAsObjectIdsForKey('_id');
    if (result) {
      setStringIdsAsObjectIdsForKey('_rid');
    }
    if (result) {
      setStringIdsAsObjectIdsForKey('_pid');
    }
    return result;
  };

  /**
   * return the collection for find your own things not possible here. this is
   * useful for distinct queries, specific sortations and so on.
   */
  this.getCollection = function(collectionName) {
    return db.collection(collectionName);
  };

  this.getCountOfCollectionEntries = function(collectionName, state, callback) {
    var result = {};
    result._cn = collectionName;
    if (state) {
      result._state = state;
      // count things with a specific state
      db.collection(collectionName).count({
        _state : state
      }, function(err, count) {
        result.result = count;
        callback(err, result);
      });
    } else {
      // count things of all states
      db.collection(collectionName).count(function(err, count) {
        result.result = count;
        callback(err, result);
      });
    }
  };

  this.getCountOfAllEntries = function(callback) {
    var result = {};
    var total = 0;
    var i = 0;
    self.getCurrentCollectionNames(function(error, cns) {
      cns.forEach(function(cn) {
        self.getCountOfCollectionEntries(cn, false, function(error, count) {
          result[cn] = count.result;
          total += count.result;
          i++;
          if (i == cns.length) {
            result._total = total;
            callback(error, result);
          }
        });
      });
    });
  };

  this.addDependency = function(requestObject, state, callback) {
    var vm1 = validator.validAddDependencyObject(requestObject);
    // TODO check existence of requestObject.cn1 und requestObject.cn2
    var vm2 = validator.validState(state);
    if (vm1 == '' && vm2 == '') {
      var id1 = typeof requestObject.id1 == 'object' ? requestObject.id1 : new ObjectID(requestObject.id1);
      db.collection(requestObject.cn1).findOne({
        _id : id1
      }, function(error, entry1) {
        var id2 = typeof requestObject.id2 == 'object' ? requestObject.id2 : new ObjectID(requestObject.id2);
        db.collection(requestObject.cn2).findOne({
          _id : id2
        }, function(error, entry2) {
          vm1 = validator.validObject(entry1);
          vm2 = validator.validObject(entry2);
          if (vm1 == '' && vm2 == '') {
            var dependency = requestObject;
            delete dependency.id1;
            delete dependency.id2;
            delete dependency.cn1;
            delete dependency.cn2;
            dependency._id1 = entry1._id;
            dependency._cn1 = entry1._cn;
            dependency._rid1 = entry1._rid;
            dependency._id2 = entry2._id;
            dependency._cn2 = entry2._cn;
            dependency._rid2 = entry2._rid;
            internInsert('dependencies', state, dependency, callback);
          } else {
            callbackError(vm1 + ',' + vm2, 1403132122, callback);
          }
        });
      });
    } else {
      callbackError(vm1 + ',' + vm2, 1403132052, callback);
    }
  };

  /**
   * insert given entry with given state in given cn and invoke callback. before
   * entry is inserted, check existing thing that seems to be updated.
   */
  var internInsert = function(cn, state, entry, callback, valid) {
    var convertToNewlyInsertedThing = function() {
      var keys = Object.keys(entry);
      var i = keys.length;
      while (i--) {
        if (keys[i].match(/^_/) && keys[i] != '_secret') {
          delete entry[keys[i]];
        }
      }
    }
    var entryIsUpdateOfExisting = function() {
      var keys = Object.keys(entry);
      var i = keys.length;
      var result = false;
      while (i--) {
        if (keys[i].match(/^_/) && keys[i] != '_secret') {
          result = true;
          break;
        }
      }
      return result;
    }
    valid = valid || cn == 'dependencies' || false;
    if (!valid) {
      // validate entry before inserting
      if (entryIsUpdateOfExisting()) {
        // seems to be an update of things state
        db.collection(cn, function(err, collection) {
          collection.find({
            _id : new ObjectID(entry._id + '')
          }).toArray(function(err, existingThings) {
            var exists = existingThings && existingThings.length === 1;
            if (exists) {
              var existingThing = existingThings[0];
              // thing with id already exist: set root id of existing
              entry._rid = existingThing._rid;
            } else {
              convertToNewlyInsertedThing();
            }
            internInsert(cn, state, entry, callback, true);
          });
        });
      } else {
        internInsert(cn, state, entry, callback, true);
      }
    } else {
      var result = entry;
      result._host = appConf.server.host;
      result._version = require(__dirname + "/../package.json").version;
      result._cn = cn;
      result._rid = entry._rid ? entry._rid : false;
      result._pid = entry._id ? entry._id : null;
      delete entry._id;
      result._state = state;
      result._date = heinzelmann.util('common-date-format').getRow();
      result._plausibility = 0; // TODO implement it! 100 means: looks like good
      // data (matching attrs and values of other cns).
      // 0 means spam.
      result._reviewed = false; // TODO implement it! true means: a human
      // verified
      // it
      result._deleted = false; // TODO implement it! true means: a human
      result._secret = entry._secret ? entry._secret : null;

      // resend _rid and _pid are shipped as string
      // create ObjectId from it ...
      result = getStringIdsAsObjectIds(result);

      if (result) { // ... what may fail
        // verification says deleted
        // it and it is a breach of a rule of our terms
        // insert result
        db.collection(cn, function(err, collection) {
          collection.find({
            _id : result._pid
          }).toArray(function(err, parents) {
            db.collection(cn, function(err, collection2) {
              collection2.count({
                _pid : result._pid
              }, function(err, count) {
                if (parents && parents.length == 1) {
                  result._branch = parents[0]._branch ? parents[0]._branch + ',' + count : count;
                } else {
                  result._branch = '0';
                }
                collection.insert(result, function() {
                  if (result._rid) {
                    delete result._secret;
                    delete result._deleted;
                    callback(err, result);
                  } else {
                    // newly inserted root elements do not have a _rid.
                    // set inserted id as _rid here and then call callback.
                    result._rid = result._id;
                    collection.update({
                      _id : result._id
                    }, result, {
                      upsert : false
                    }, function() {
                      delete result._secret;
                      delete result._deleted;
                      callback(err, result);
                    });
                  }
                });
              });
            });
          });
        });
      } else {
        callbackError('invalid params', 1409061916, callback);
      }
    }
  };
  /**
   * insert a entry and return result
   * 
   * @param cn
   *          the collection name
   * @param state
   *          of the entry
   * @param entry
   *          to insert
   * @param callback
   *          1st param error (if), 2nd array of records inserted:
   *          {@link http://mongodb.github.io/node-mongodb-native/markdown-docs/insert.html}
   */
  this.insert = function(cn, state, entry, callback) {
    var vm1 = validator.insertableEntryObject(self, entry);
    var vm2 = validator.validState(state);
    var vm3 = validator.validStringNotEmpty(cn);
    if (vm1 == '' && vm2 == '' && vm3 == '') {
      internInsert(cn, state, entry, callback);
    } else {
      callbackError(vm1 + ',' + vm2 + ',' + vm3, -1207171246, callback);
    }
  };
  /**
   * alias for insert
   */
  this.add = function(cn, state, entry, callback) {
    this.insert(cn, state, entry, callback);
  };
};
