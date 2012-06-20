'use strict';

var CmdParser = require('../parser');

exports.parserTest = {
  "single word command": function (test) {
    var cmdparser = new CmdParser([
      "test"
    ]);
    var results = cmdparser.parse("test");
    test.equal(results.name, "test");
    test.done();
  },

  "single word command, no match": function (test) {
    var cmdparser = new CmdParser([
      "test"
    ]);
    var results = cmdparser.parse("bad");
    test.equal(results, null);
    test.done();
  },

  "one required parameter": function (test) {
    var cmdparser = new CmdParser([
      "test <param1>"
    ]);
    var results = cmdparser.parse("test val");
    test.equal(results.name, "test");
    test.equal(results.params.param1, "val");
    test.done();
  },

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

  "optional parameter literal string, match": function (test) {
    var cmdparser = new CmdParser([
      'test ["TEST"]'
    ]);
    var results = cmdparser.parse("test test");
    test.equal(results.name, "test");
    test.equal(results.params.TEST, true);
    test.done();
  }
};
