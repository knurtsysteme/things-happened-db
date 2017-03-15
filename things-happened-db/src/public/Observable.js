/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var Observable = function() {
  
  // -- construct
  
  var observers = [];
  
  // -- public
  
  this.addObserver = function(observer) {
    observers.push(observer);
  };
  
  this.notifyObservers = function() {
    $(observers).each(function(i, observer) {
      observer.update();
    });
  };
  
};
