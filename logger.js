var winston = require('winston');
var config = require('./config.json');

var logger = new (winston.Logger)({
  transports : [ new winston.transports.File({
    filename : __dirname + '/' + config.app.logger.files.main,
    json : false
  }) ],
  exceptionHandlers : [ new winston.transports.File({
    filename : __dirname + '/' + config.app.logger.files.error,
    json : false
  }) ],
  exitOnError : false
});

module.exports = logger;