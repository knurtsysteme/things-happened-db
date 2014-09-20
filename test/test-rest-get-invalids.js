/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var tools = require(__dirname + '/utils/rest.js');
var assertion = require(__dirname + '/utils/assertion.js');

exports.emptyState = function(test) {
  tools.getRequest('get/notacollection/.json', assertion.isError(test));
};
