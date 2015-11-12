/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var express = require('express');
var mongodb = require('mongodb');
var config = require('./config.json');
var routes = require('./routes');
var heinzelmann = require('heinzelmann');
var logger = require('./logger');
var app = module.exports = express.createServer();

// CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(allowCrossDomain);
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  // Handle 404
  app.use(function(req, response) {
    response.charset = 'UTF-8';
    response.setHeader('Content-Type', 'application/json');
    response.send('{"_http-status":404,"_ok":-404}', 404);
    logger.info('404');
  });

  // Handle 500
  app.use(function(error, req, response, next) {
    response.charset = 'UTF-8';
    response.setHeader('Content-Type', 'application/json');
    response.send('{"message":"check your request","_http-status":500,"_ok":-500}', 500);
    logger.info('500');
  });
});
app.configure('test', function() {
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions : true,
    showStack : true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

app.post(/^\/addto\/everything\/([a-z0-9]+)\.json\??(.+)?$/, routes.response406);
app.post(/^\/addto\/dependencies\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseResultOfDependencyInsertion);
app.post(/^\/addto\/([a-z0-9]+)\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseResultOfInsertion);
app.post(/^\/([a-z0-9]+)\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseUnknown);

app.get(/^\/get\/everything\/([a-z0-9]+)\.json\??(.+)?$/, routes.response406);
app.get(/^\/get\/happened\/to\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseWhatHappenedToThings);
app.get(/^\/get\/([a-z0-9]+)\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseEntriesInCollectionWithState);
app.get(/^\/get\/things\.json\??(.+)?$/, routes.responseCurrentCollectionNames);
app.get(/^\/get\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseEntriesInCollection);

app.get(/^\/count\/things\.json\??(.+)?$/, routes.responseCountOfAllEntries);
app.get(/^\/count\/([a-z0-9]+)\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseCountOfCollectionEntries);
app.get(/^\/count\/([a-z0-9]+)\.json\??(.+)?$/, routes.responseCountOfCollectionEntries);
app.get(/^\/([a-z0-9\.-_\/]+)\.json\??(.+)?$/, routes.responseUnknown);

app.listen(config.server.port, function() {
  logger.info("http://%s:%s/addto/app/started.json -> {'db':'%s', 'mode':'%s'}", config.server.host, app.address().port, config.db.name, app.settings.env);
});
