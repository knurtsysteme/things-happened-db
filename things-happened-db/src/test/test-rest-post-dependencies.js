/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');

exports.addDependenciesWithoutInfoObject = function(test) {
  var data = null;
  var testfunc = function(error, response, dependency) {
    test.expect(13);
    test.equals(dependency._ok, 1);
    test.equals(dependency._cn, 'dependencies');
    test.equals(dependency._id.length, 24);
    test.equals(dependency._id1, data.id1);
    test.equals(dependency._id2, data.id2);
    test.equals(dependency._cn1, data.cn1);
    test.equals(dependency._cn2, data.cn2);
    test.ok(dependency._rid1);
    test.ok(dependency._rid2);
    test.ok(!dependency.id1);
    test.ok(!dependency.id2);
    test.ok(!dependency.cn1);
    test.ok(!dependency.cn2);
    test.done();
  };
  var addDependency = function(error, response, body) {
    var id1 = body[0]._id;
    var id2 = body[1]._id;
    var cn1 = body[0]._cn;
    var cn2 = body[1]._cn;
    data = {
      id1 : id1,
      id2 : id2,
      cn1 : cn1,
      cn2 : cn2
    };
    tools.postRequest('addto/dependencies/exploded.json', data, testfunc);
  };
  tools.withDiseasesHailed(addDependency, true);
};

exports.addDependenciesWithInfoObject = function(test) {
  var data = null;
  var testfunc = function(error, response, dependency) {
    test.expect(9);
    test.equals(dependency._ok, 1);
    test.equals(dependency._cn, 'dependencies');
    test.equals(dependency._id.length, 24);
    test.equals(dependency._id1, data.id1);
    test.equals(dependency._id2, data.id2);
    test.equals(dependency._cn1, data.cn1);
    test.equals(dependency._cn2, data.cn2);
    test.equals(dependency.hat, 'schi');
    test.equals(dependency.schnief, 'nies');
    test.done();
  };
  var addDependency = function(error, response, body) {
    var id1 = body[0]._id;
    var id2 = body[1]._id;
    var cn1 = body[0]._cn;
    var cn2 = body[1]._cn;
    data = {
      id1 : id1,
      id2 : id2,
      cn1 : cn1,
      cn2 : cn2,
      hat : 'schi',
      schnief : 'nies'
    };
    tools.postRequest('addto/dependencies/exploded.json', data, testfunc);
  };
  tools.withDiseasesHailed(addDependency, true);
};
