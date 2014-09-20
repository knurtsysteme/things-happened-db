/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

/**
 * data access object for code without borders. this is observable. observers
 * are called after docs are fetched from server or a doc was added.
 */
var ThingsHappenedDao = function(options) {

  // -- construct

  options = options || {};
  var self = this;
  if (typeof (options) != 'object') {
    throw 'need an object here';
  }
  options.serviceurl = options.serviceurl || 'http://localhost:3000/';
  options.ajaxoptions = {
    crossDomain : true,
    dataType : 'json'
  };
  var observers = [];

  // -- public

  /**
   * add an observer instance here to call it after fetching and adding docs.
   * 
   * @param observer
   *            the observer for add and get methods. if setDao is implemented
   *            in observer, "this" is set as dao for the given observer.
   */
  this.addObserver = function(observer) {
    observers.push(observer);
    if (observer.setDao)
      observer.setDao(self);
  };

  this.getServiceurl = function() {
    return options.serviceurl;
  };

  /**
   * add the given doc into cwb and call every registered observers with the
   * response from server and action 'add'
   */
  this.add = function(doc) {
    var ajaxoptions = options.ajaxoptions;
    ajaxoptions.data = doc.getData();
    ajaxoptions.type = 'POST';
    ajaxoptions.url = options.serviceurl + 'addto/' + doc.getCN() + '/' + doc.getState() + '.json';
    requestServer(ajaxoptions, 'addto/things/happened');
  };

  /**
   * get all docs from cwb and call every registered observers with the action
   * 'get'.
   * 
   * @param query
   *            a {@link AbstractQuery}
   */
  this.get = function(query, action) {
    var ajaxoptions = options.ajaxoptions;
    ajaxoptions.data = {};
    ajaxoptions.data.criteria = query.getCriteria();
    ajaxoptions.data.projection = query.getProjection();
    ajaxoptions.type = 'GET';
    ajaxoptions.url = options.serviceurl + 'get/' + query.getCN();
    if (query.getState && query.getState()) {
      ajaxoptions.url += '/' + query.getState();
    }
    ajaxoptions.url += '.json';
    if (!action) {
      action = 'get/things';
      if (query.getState && query.getState()) {
        action += '/happened';
      }
    }
    requestServer(ajaxoptions, action);
  };

  this.getNamesOfThings = function() {
    var query = QueryFactory.getQuery('things');
    self.get(query);
  };

  /**
   * return the document of the given cn having the given id.
   * return it as an array - empty, if not found or haven the element
   * as one and only.
   */
  this.getThingWithId = function(cn, id) {
    var query = QueryFactory.getQuery(cn, null, {
      _id : id
    });
    self.get(query, 'get/things/withid');
  };

  this.getWhatHappenedToThings = function(cn) {
    var ajaxoptions = options.ajaxoptions;
    ajaxoptions.data = {};
    ajaxoptions.type = 'GET';
    ajaxoptions.url = options.serviceurl + 'get/happened/to/' + cn + '.json';
    requestServer(ajaxoptions, 'get/happened/to');
  };

  // -- private
  var requestServer = function(ajaxoptions, action) {
    var dones = function(response) {
      if (response._err) {
        $(observers).each(function(i, observer) {
          observer.error(response, action);
        });
      } else {
        $(observers).each(function(i, observer) {
          observer.done(response, action);
        });
      }
    };
    var errors = function(response) {
      $(observers).each(function(i, observer) {
        observer.error(response, action);
      });
    };
    $.ajax(ajaxoptions).done(dones).error(errors);
  };

};
