/**
 * every thing is a node in a root-tree of things. and every node in a root-tree
 * is part of a branch (the shortest way to root).
 * 
 * we can decide the shortest way to the root of a thing ("the branch") by
 * having a look at its parent id (_pid) and parent's parent id. in fact this is
 * impracticable, because of getting the branch means one request for every
 * thing in the branch.
 * 
 * this is the reason, why we introduce the new thing-field "_branch" here.
 * 
 * the root of a tree always have: {_branch:'0'}.<br />
 * a child of a root: {_branch:'0,0'}.<br />
 * a second child of a root: {_branch:'0,1'}.<br />
 * a child of the second child of the root: {_branch:'0,1,0'}.<br />
 * (think you got it).
 * 
 * having this in every thing, you can simply request a branch by:
 * http://things-happened.org/get/books.json?criteria={"_branch":{"$in":["0","0,1","0,1,0"]}}
 * 
 * this query will be supported by the things-happened client lib. TODO link it:<br />
 * ThingsQuery.select('books').branchOf(myBook); TODO not implemented yet!
 * 
 * @see ThingsQuery client lib TODO link it
 * @since 09/17/2014
 */
var vows = require('vows');
var assert = require('assert');
var tools = require(__dirname + '/utils/rest.js');
var specs = require(__dirname + '/utils/defaultspecs.js');

var bookWritten = false;
var topics = {};
var book = {
  title : 'Title of a great book',
  geo : '34.520917 13.40245'
};
topics.insertABookWritten = function(callback) {
  var self = this;
  callback = callback || self.callback;
  tools.postRequest('addto/books/written.json', book, callback);
};
topics.insertABookWrittenAndRead = function(callback) {
  var self = this;
  callback = callback || self.callback;
  topics.insertABookWritten(function(err, response) {
    var bw = JSON.parse(response.body);
    bw.by = 'Daniel Oltmanns';
    tools.postRequest('addto/books/read.json', bw, callback);
  });
};
topics.insertABookWrittenAnd2Read = function(callback) {
  var self = this;
  callback = callback || self.callback;
  topics.insertABookWritten(function(err, response) {
    var bw = JSON.parse(response.body);
    bw.by = 'Daniel Oltmanns';
    tools.postRequest('addto/books/read.json', bw, function() {
      tools.postRequest('addto/books/read.json', bw, callback);
    });
  });
};
topics.insertABookWritten2ReadAndSecondCommented = function(callback) {
  var self = this;
  callback = callback || self.callback;
  topics.insertABookWrittenAnd2Read(function(err, response) {
    var book2 = JSON.parse(response.body);
    book2.comment = 'nice book';
    tools.postRequest('addto/books/commented.json', book2, callback);
  });
};
topics.insertBooksReturnTree = function(callback) {
  var self = this;
  callback = callback || self.callback;
  topics.insertABookWritten2ReadAndSecondCommented(function(err, response) {
    var book = JSON.parse(response.body);
    tools.getRequest('get/books.json', callback, {
      _rid : book._rid
    });
  });
};

vows.describe('Every thing have a field _branch').addBatch({
  'when posting a new book written' : {
    topic : topics.insertABookWritten,
    'the book should' : {
      'have the field _branch' : specs.assertResponse.json.key('_branch').exists(),
      'be the root of the branch' : specs.assertResponse.json.key('_branch').hasValue('0')
    }
  },
  'when posting same book read' : {
    topic : topics.insertABookWrittenAndRead,
    'the book should' : {
      'have the field _branch' : specs.assertResponse.json.key('_branch').exists(),
      'has book written as parent' : specs.assertResponse.json.key('_pid').not.hasValue(null),
      'have _branch == 0,0' : specs.assertResponse.json.key('_branch').hasValue('0,0')
    }
  },
  'when posting same book read on written book a second time' : {
    topic : topics.insertABookWrittenAnd2Read,
    'the book should' : {
      'have the field _branch' : specs.assertResponse.json.key('_branch').exists(),
      'have _branch == 0,1' : specs.assertResponse.json.key('_branch').hasValue('0,1')
    }
  },
  'when posting a comment on a book read a second time' : {
    topic : topics.insertABookWritten2ReadAndSecondCommented,
    'the book should' : {
      'have the field _branch' : specs.assertResponse.json.key('_branch').exists(),
      'have _branch == 0,1,0' : specs.assertResponse.json.key('_branch').hasValue('0,1,0'),
    }
  },
  'after all a book-tree' : {
    topic : topics.insertBooksReturnTree,
    'still have a root with null _pid and _branch "0"' : function(err, response) {
      var books = JSON.parse(response.body);
      assert.isTrue(books.length > 0);
      var i = books.length;
      var foundRootTree = false;
      while (i--) {
        if (books[i]._pid == null && books[i]._branch == '0') {
          foundRootTree = true;
          break;
        }
      }
      assert.isTrue(foundRootTree);
    },
    'have the right pids and rids' : function(err, response) {
      var books = JSON.parse(response.body);
      var idLevel1, pidLevel2a, pidLevel2b, idLevel2, pidLevel3;
      var i = books.length;
      while (i--) {
        if (books[i]._branch == '0') {
          idLevel1 == books[i]._id;
        } else if(books[i]._branch == '0,1') {
          pidLevel2a == books[i]._pid;
          idLevel2 == books[i]._id;
        } else if(books[i]._branch == '0,0') {
          pidLevel2b == books[i]._pid;
        } else if(books[i]._branch == '0,1,0') {
          pidLevel3 == books[i]._pid;
        }
      }
      assert.isNotNull(idLevel1);
      assert.isNotNull(pidLevel2a);
      assert.isNotNull(pidLevel2b);
      assert.isNotNull(idLevel2);
      assert.isNotNull(pidLevel3);
      assert.equal(pidLevel2a, pidLevel2b);
      assert.equal(pidLevel2a, idLevel1);
      assert.equal(pidLevel2b, idLevel1);
      assert.equal(pidLevel3, idLevel2);
    }
  }
}).exportTo(module); // Run it
