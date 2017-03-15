/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

exports.validObject = function(object) {
  var result = '';
  if (!object) {
    result = 'no entry given';
  } else if (typeof object != 'object') {
    result = 'entry must be an object';
  }
  return result;
};

exports.validStringNotEmpty = function(str) {
  var result = '';
  if (!str || typeof str != 'string') {
    result = 'must be string';
  } else if (str.trim().length <= 0) {
    result = 'string is empty';
  }
  return result;
};

exports.validAddDependencyObject = function(obj) {
  var result = this.validObjectId(obj.id1);
  if (result == '') {
    result = this.validObjectId(obj.id2);
  }
  if (result == '') {
    result = this.validStringNotEmpty(obj.cn1);
  }
  if (result == '') {
    result = this.validStringNotEmpty(obj.cn2);
  }
  return result;
};

exports.insertableEntryObject = function(dao, entry) {
  var result = this.validObject(entry);
  if (result == '') {
    if (entry.depencencies) {
      result = 'attribute dependencies is not allowed in entry';
    }
  }
  if (result == '') {
    // two possibilities:
    // 1. isNew: a very new object (must not have '_' but '_secret')
    // 2. isUpdate: an object update (have all '_'-attributes and values of the
    // old entry)
    var isNew = true; // 1st possibility
    var isUpdate = true; // 2nd possibility
    Object.keys(entry).forEach(function(key) {
      if (key.match(/^_.*/) && key != '_secret') {
        isNew = false;
      }
    });
    isUpdate = !isNew;
    if (!isNew) {
      var hasValidEntryId = this.validObjectId(entry._id);
      var hasCN = this.validStringNotEmpty(entry._cn);
      if (hasValidEntryId && hasCN) {
        dao.getEntries(entry._cn, function(error, existingEntry) {
          if (!error) {
            Object.keys(existingEntry).forEach(function(key) {
              if (key.match(/^_.*/)) {
                var hasKey = Object.keys(entry).indexOf(key) >= 0;
                if (!hasKey || entry[key] + '' != existingEntry[key] + '') {
                  isUpdate = false;
                }
              }
            });
          }
        }, {
          _id : entry._id
        });
      }
    }
    if (!isNew && !isUpdate) {
      result = 'attributes of new entries must not start with a "_" but "_secret". send entire "_"-attributes of old entry for an update.';
    }
  }
  return result;
};

exports.validState = function(state) {
  var result = '';
  if (!state || state.length <= 0) {
    result = 'no state given';
  }
  return result;
};

exports.validObjectId = function(id) {
  var result = '';
  if (!id) {
    result = 'no id given';
  } else if (id + ''.match(/^[a-zA-Z0-9-_]+/) == false) {
    result = 'Allowed characters for key a-zA-Z0-9-_ given ' + key + ' given. Check content-type of request!';
  }
  return result;
};
