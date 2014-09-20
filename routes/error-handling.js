/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

exports.getErrorObject = function(message, id) {
  id = id > 0 ? (id * -1) : id;
  return {
    _err : message,
    _ok : id
  };

};