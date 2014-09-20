/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var assertion = require(__dirname + '/utils/assertion.js');

exports.getWhatsHappenedToThings = function(test) {
  var gotThingsHappenedToDiseases = function(error, response, happened) {
    var noticedExist = false;
    var hailedExist = false;
    for ( var i in happened) {
      if (happened[i] == 'noticed') {
        noticedExist = true;
      } else if (happened[i] == 'hailed') {
        hailedExist = true;
      }
    }

    test.expect(2);
    test.ok(hailedExist);
    test.ok(noticedExist);
    test.done();
  };
  tools.getRequest('get/happened/to/diseases.json', gotThingsHappenedToDiseases);
};
