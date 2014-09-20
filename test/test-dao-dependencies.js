/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var db = require(__dirname + '/utils/db-config.js').db;
var delegator = require(__dirname + '/../routes/CWBDao.js');

exports.selftest = function(test) {
  db.open(function() {
    test.expect(1);
    test.ok(true);
    test.done();
    db.close();
  });
};

exports.addValidDependency = function(test) {
  db.open(function() {
    var dao = new delegator.CWBDao(db);
    dao.getEntries('diseases', function(err, diseases) {
      var dependencyObject = tools.getDependencyObject(diseases[0], diseases[1]);
      dao.addDependency(dependencyObject, 'init', function(err, dependency) {
        test.expect(7);
        test.ok(dependency);
        test.equals(diseases[0]._id + '', dependency._id1 + '');
        test.equals(diseases[1]._id + '', dependency._id2 + '');
        test.equals(diseases[0]._cn, dependency._cn1);
        test.equals(diseases[1]._cn, dependency._cn2);
        test.equals(diseases[0]._rid, dependency._rid1 + '');
        test.equals(diseases[1]._rid, dependency._rid2 + '');
        test.done();
        db.close();
      });
    });
  });
};
