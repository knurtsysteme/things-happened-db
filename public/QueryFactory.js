/*! things-happened | Copyright(c) 2014 by Daniel Oltmanns (http://www.knurt.de) - MIT Licensed */

var QueryFactory = {

  getDependencyQuery : function(cn1, id1, cn2, id2, state) {
    return {
      getData : function() {
        return {
          id1 : id1,
          id2 : id2,
          cn1 : cn1,
          cn2 : cn2
        };
      },
      getCN : function() {
        return 'dependencies';
      },
      getState : function() {
        return state;
      }
    };
  },

  getQuery : function(cn, state, criteria, projection) {
    state = state || null;
    criteria = criteria || {};
    projection = projection || {};
    return {
      getCriteria : function() {
        return criteria;
      },
      getProjection : function() {
        return projection;
      },
      getState : function() {
        return state;
      },
      getCN : function() {
        return cn;
      }
    };
  },

  getNewDoc : function(cn, state, data) {
    if (cn, state, Object.keys(data).length > 0) {
      return {
        getData : function() {
          return data;
        },
        getState : function() {
          return state;
        },
        getCN : function() {
          return cn;
        }
      };
    } else {
      console.error('invalid factory parameters for a doc');
      return null;
    }
  }
};
