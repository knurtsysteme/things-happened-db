/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var webSocketServer = require('websocket').server;
var config = require('./config.json');
var http = require('http');
var logger = require('./logger');
var wsServer = new webSocketServer({
  httpServer : http.createServer().listen(config.server.wsport, function() {
    logger.info('websocket listening on port ' + config.server.wsport);
  })
});
var clients = [];
wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  var index = clients.length;
  clients.push(connection);
  logger.info('connecting client ' + clients.length + '.');
  connection.sendUTF(JSON.stringify({
    message : 'You are client number ' + clients.length,
    _ok : true
  }));

  // user sent some message
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      // FIXME speichere hier ggf. ein secret aus dem request um in unten
      // abzugleichen (siehe aksdfhio8zu938haiuf)
      connection.sendUTF(JSON.stringify({
        _ok : false,
        message : 'no need to send me messages. please use good old http!'
      }));
    }
  });

  // user disconnected
  connection.on('close', function(connection) {
    logger.info('peer ' + connection.remoteAddress + ' disconnected');
    clients.splice(index, 1);
  });

});

// FIXME an diese stelle wird alles gesendet, auch wenn der user sich auf things
// mit einem bestimmten secret beschränkt hat
// deshalb muss der user sich am webserver ggf. mit einem passwort anmelden
// können (s.o. aksdfhio8zu938haiuf)
exports.sendInsertedThing = function(thing) {
  clients.forEach(function(client) {
    client.sendUTF(JSON.stringify(thing));
  });
};