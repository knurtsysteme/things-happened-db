/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var assertion = require(__dirname + '/utils/assertion.js');
var db = require(__dirname + '/utils/db-config.js').db;
var delegator = require(__dirname + '/../routes/CWBDao.js');

exports.rootEntryHasItsIdAsRid = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    dao.add('schools', 'burned', {
      'name' : 'Hot School'
    }, function(err, result) {
      test.expect(3);
      test.ok(result);
      test.ok(result._id);
      test.equal(result._id + '', result._rid + '');
      test.done();
      db.close();
    });
  });
};

var school = {
  'name' : 'Albertus Einstein Highschool'
};
var idOfRoot = null;
var idOf1stChild = null;

exports.rootEntryHasNullPid = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    dao.add('schools', 'built', school, assertion.keysValues(test, {
      _pid : null
    }));
    idOfRoot = school._id + '';
    db.close();
  });
};

exports.updateEntry1stTime = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    idOfRoot = school._id;
    school.name = 'Albert Einstein Highschool';
    dao.add('schools', 'built', school, assertion.keysValues(test, {
      _pid : idOfRoot,
      _rid : idOfRoot
    }));
    idOf1stChild = school._id;
    db.close();
  });
};
exports.selftest = function(test) {
  test.expect(1);
  test.notEqual(idOfRoot + '', idOf1stChild + '');
  test.done();
};

exports.updateEntry2ndTime = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    school.name = 'Albert Einstein Highschool';
    dao.add('schools', 'built', school, assertion.keysValues(test, {
      _pid : school._id,
      _rid : idOfRoot
    }));
    db.close();
  });
};
