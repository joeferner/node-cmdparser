'use strict';

const CmdParser = require('../parser');
const expect = require('chai').expect;

describe('completer tests', function() {

  it('single word command', function (done) {
    const cmdparser = new CmdParser([
      "test"
    ]);
    cmdparser.completer("te", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["test "],
        "te"
      ], 'command was parsed');
      done();
    });
  });

  it('single word command, multiple matches', function (done) {
    const cmdparser = new CmdParser([
      "test1",
      "test2"
    ]);
    cmdparser.completer("te", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["test1 ", "test2 "],
        "te"
      ], 'command was parsed');
      done();
    });
  });

  it('single word command, no match', function (done) {
    const cmdparser = new CmdParser([
      "test"
    ]);
    cmdparser.completer("bad", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results, 'no command found by parser').to.be.undefined;
      done();
    });
  });

  it('one required parameter', function (done) {
    const cmdparser = new CmdParser([
      "test param1"
    ], {
      param1: function (partial, callback) {
        process.nextTick(function () {
          callback(null, [partial + "1", partial + "2", partial + "3"]);
        });
      }
    });
    cmdparser.completer("test val", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["val1", "val2", "val3"],
        "val"
      ], 'command was parsed');
      done();
    });
  });

  it('literal', function (done) {
    const cmdparser = new CmdParser([
      "test [TEST]"
    ]);
    cmdparser.completer("test T", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["TEST"],
        "T"
      ], 'command was parsed');
      done();
    });
  });
});
