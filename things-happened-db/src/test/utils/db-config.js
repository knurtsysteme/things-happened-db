/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var heinzelmann = require('heinzelmann');
var appConf = require(__dirname + '/../../config.json');
exports.db = heinzelmann.util('mongo-factory', appConf.db.name).client();
