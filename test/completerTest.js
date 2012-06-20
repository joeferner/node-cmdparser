'use strict';

var CmdParser = require('../parser');

exports.completerTest = {
  "single word command": function (test) {
    var cmdparser = new CmdParser([
      "test"
    ]);
    var results = cmdparser.completer("te");
    test.deepEqual(results, [
      ["test"],
      "te"
    ]);
    test.done();
  },

  "single word command, multiple matches": function (test) {
    var cmdparser = new CmdParser([
      "test1",
      "test2"
    ]);
    var results = cmdparser.completer("te");
    test.deepEqual(results, [
      ["test1", "test2"],
      "te"
    ]);
    test.done();
  },

  "single word command, no match": function (test) {
    var cmdparser = new CmdParser([
      "test"
    ]);
    var results = cmdparser.completer("bad");
    test.equal(results, null);
    test.done();
  },

  "one required parameter": function (test) {
    var cmdparser = new CmdParser([
      "test <param1>"
    ], {
      param1: function (str) {
        return str + "123";
      }
    });
    var results = cmdparser.completer("test val");
    test.deepEqual(results, [
      ["val123"],
      "val"
    ]);
    test.done();
  },

  /*
   "two required parameters": function (test) {
   var cmdparser = new CmdParser([
   "test <param1> <param2>"
   ]);
   var results = cmdparser.parse("test val1 val2");
   test.equal(results.name, "test");
   test.equal(results.params.param1, "val1");
   test.equal(results.params.param2, "val2");
   test.done();
   },

   "ignore the whitespace": function (test) {
   var cmdparser = new CmdParser([
   "test <param1> <param2>"
   ]);
   var results = cmdparser.parse("test \t val1 \t val2");
   test.equal(results.name, "test");
   test.equal(results.params.param1, "val1");
   test.equal(results.params.param2, "val2");
   test.done();
   },

   "one optional parameter, not given": function (test) {
   var cmdparser = new CmdParser([
   "test [param1]"
   ]);
   var results = cmdparser.parse("test");
   test.equal(results.name, "test");
   test.equal(results.params.param1, null);
   test.done();
   },

   "one optional parameter, given": function (test) {
   var cmdparser = new CmdParser([
   "test [param1]"
   ]);
   var results = cmdparser.parse("test val");
   test.equal(results.name, "test");
   test.equal(results.params.param1, "val");
   test.done();
   },

   "optional parameter multivalue": function (test) {
   var cmdparser = new CmdParser([
   "test [param1 param2]"
   ]);
   var results = cmdparser.parse("test val1 val2");
   test.equal(results.name, "test");
   test.equal(results.params.param1, "val1");
   test.equal(results.params.param2, "val2");
   test.done();
   },

   "optional parameter literal string, match": function (test) {
   var cmdparser = new CmdParser([
   'test ["TEST"]'
   ]);
   var results = cmdparser.parse("test test");
   test.equal(results.name, "test");
   test.equal(results.params.TEST, true);
   test.done();
   },

   "optional parameter literal string, no match": function (test) {
   var cmdparser = new CmdParser([
   'test ["TEST"]'
   ]);
   var results = cmdparser.parse("test");
   test.equal(results.name, "test");
   test.equal(results.params.TEST, false);
   test.done();
   },

   "multiple optional with literal string, first": function (test) {
   var cmdparser = new CmdParser([
   'test ["TEST1"] ["TEST2"]'
   ]);
   var results = cmdparser.parse("test test1");
   test.equal(results.name, "test");
   test.equal(results.params.TEST1, true);
   test.equal(results.params.TEST2, false);
   test.done();
   },

   "multiple optional with literal string, second": function (test) {
   var cmdparser = new CmdParser([
   'test ["TEST1"] ["TEST2"]'
   ]);
   var results = cmdparser.parse("test test2");
   test.equal(results.name, "test");
   test.equal(results.params.TEST1, false);
   test.equal(results.params.TEST2, true);
   test.done();
   },

   "multiple optional with literal string and params": function (test) {
   var cmdparser = new CmdParser([
   'test ["TEST1" param1] ["TEST2" param2]'
   ]);
   var results = cmdparser.parse("test test1 val1");
   test.equal(results.name, "test");
   test.equal(results.params.TEST1, true);
   test.equal(results.params.param1, 'val1');
   test.equal(results.params.TEST2, false);
   test.done();
   },

   "repeat single parmeter": function (test) {
   var cmdparser = new CmdParser([
   'test [param1 ...]'
   ]);
   var results = cmdparser.parse("test val1 val2");
   test.equal(results.name, "test");
   test.equal(results.params.param1.length, 2);
   test.equal(results.params.param1[0], 'val1');
   test.equal(results.params.param1[1], 'val2');
   test.done();
   },

   "repeat single parmeter, not given": function (test) {
   var cmdparser = new CmdParser([
   'test [param1 ...]'
   ]);
   var results = cmdparser.parse("test");
   test.equal(results.name, "test");
   test.equal(results.params.param1, null);
   test.done();
   }
   */
};
