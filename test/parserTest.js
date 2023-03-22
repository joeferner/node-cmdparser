'use strict';

const CmdParser = require('../parser');
const expect = require('chai').expect;

describe('parser tests', function() {

  it('single word command', function (done) {
    const cmdparser = new CmdParser([
      "test"
    ]);
    cmdparser.parse("test", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      done();
    });
  });

  it('single word command, no match', function (done) {
    const cmdparser = new CmdParser([
      "test"
    ]);
    cmdparser.parse("bad", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.be.undefined;
      done();
    });
  });

  it('one required parameter', function (done) {
    const cmdparser = new CmdParser([
      "test param1"
    ]);
    cmdparser.parse("test val", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal("val", 'param 1 matches');
      done();
    });
  });

  it('two required parameters', function (done) {
    const cmdparser = new CmdParser([
      "test param1 param2"
    ]);
    cmdparser.parse("test val1 val2", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal("val1", 'param 1 matches');
      expect(results.params.param2).to.equal("val2", 'param 2 matches');
      done();
    });
  });

  it('ignore the whitespace', function (done) {
    const cmdparser = new CmdParser([
      "test param1 param2"
    ]);
    cmdparser.parse("test \t val1 \t val2", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal("val1", 'param 1 matches');
      expect(results.params.param2).to.equal("val2", 'param 2 matches');
      done();
    });
  });

  it('one optional parameter, not given', function (done) {
    const cmdparser = new CmdParser([
      "test [param1]"
    ]);
    cmdparser.parse("test", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1, 'param 1 is not set').to.be.undefined;
      done();
    });
  });

  it('one optional parameter, given', function (done) {
    const cmdparser = new CmdParser([
      "test [param1]"
    ]);
    cmdparser.parse("test val", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal("val", 'param 1 matches');
      done();
    });
  });

  it('optional parameter multivalue', function (done) {
    const cmdparser = new CmdParser([
      "test [param1 param2]"
    ]);
    cmdparser.parse("test val1 val2", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal("val1", 'param 1 matches');
      expect(results.params.param2).to.equal("val2", 'param 2 matches');
      done();
    });
  });

  it('optional parameter literal string, match', function (done) {
    const cmdparser = new CmdParser([
      'test [TEST]'
    ]);
    cmdparser.parse("test test", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.TEST, 'param TEST is true').to.be.true;
      done();
    });
  });

  it('optional parameter literal string, no match', function (done) {
    const cmdparser = new CmdParser([
      'test [TEST]'
    ]);
    cmdparser.parse("test", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.be.undefined;
      done();
    });
  });

  it('multiple optional with literal string, first', function (done) {
    const cmdparser = new CmdParser([
      'test [TEST1] [TEST2]'
    ]);
    cmdparser.parse("test test1", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.TEST1, 'param TEST1 is true').to.be.true;
      expect(results.params.TEST2, 'param TEST2 is false').to.be.false;
      done();
    });
  });

  it('multiple optional with literal string, second', function (done) {
    const cmdparser = new CmdParser([
      'test [TEST1] [TEST2]'
    ]);
    cmdparser.parse("test test2", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.TEST1, 'param TEST1 is false').to.be.false;
      expect(results.params.TEST2, 'param TEST2 is true').to.be.true;
      done();
    });
  });

  it('multiple optional with literal string and params', function (done) {
    const cmdparser = new CmdParser([
      'test [TEST1 param1] [TEST2 param2]'
    ]);
    cmdparser.parse("test test1 val1", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.TEST1, 'param TEST1 is true').to.be.true;
      expect(results.params.param1).to.equal("val1", 'param 1 matches');
      expect(results.params.TEST2, 'param TEST2 is false').to.be.false;
      done();
    });
  });

  it('repeat single parameter', function (done) {
    const cmdparser = new CmdParser([
      'test [param1 ...]'
    ]);
    cmdparser.parse("test val1 val2", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.be.a('Array').and.have.length(2);
      expect(results.params.param1[0]).to.equal("val1", 'param1[0] matches');
      expect(results.params.param1[1]).to.equal("val2", 'param1[1] matches');
      done();
    });
  });

  it('repeat single parameter, not given', function (done) {
    const cmdparser = new CmdParser([
      'test [param1 ...]'
    ]);
    cmdparser.parse("test", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1, 'param1 not set').to.be.undefined;
      done();
    });
  });

  it('quotes', function (done) {
    const cmdparser = new CmdParser([
      'test param1'
    ]);
    cmdparser.parse('test "hello world"', function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal("hello world", 'param 1 matches');
      done();
    });
  });

  it('quotes with escapes', function (done) {
    const cmdparser = new CmdParser([
      'test param1'
    ]);
    cmdparser.parse('test "hello \\" world"', function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results.name).to.equal("test");
      expect(results.params.param1).to.equal('hello \" world', 'param 1 matches');
      done();
    });
  });
});
