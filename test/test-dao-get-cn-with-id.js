/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var assertion = require(__dirname + '/utils/assertion.js');
var db = require(__dirname + '/utils/db-config.js').db;
var delegator = require(__dirname + '/../routes/CWBDao.js');

exports.getDocWithObjectId = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    dao.add('tvs', 'burned', {
      'name' : 'Hot TV'
    }, function(err, result) {
      var criteria = {
        _id : result._id
      };
      dao.getEntries('tvs', function(err, result2) {
        test.expect(1);
        test.equal(JSON.stringify(result), JSON.stringify(result2[0]));
        test.done();
        db.close();
      }, criteria);
    });
  });
};

exports.getDocWithInvalidId = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    dao.getEntries('tvs', function(err, result2) {
      test.expect(2);
      test.ok(err);
      test.equal('invalid criteria', err._err);
      test.done();
      db.close();
    }, {_id:'555-shoe'});
  });
};
