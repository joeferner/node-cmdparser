'use strict';

const CmdParser = require('../parser');
const expect = require('chai').expect;

describe('redis tests', function() {

  const cmdparser = new CmdParser([
      "APPEND key value",
      "AUTH password",
      "BGREWRITEAOF",
      "BGSAVE",
      "BITCOUNT key [start] [end]",
      "BITOP operation destkey key [key ...]",
      "BLPOP key [key ...] timeout",
      "BRPOP key [key ...] timeout",
      "BRPOPLPUSH source destination timeout",
      "CONFIG GET parameter",
      "CONFIG SET parameter value",
      "CONFIG RESETSTAT",
      "DBSIZE",
      "DEBUG OBJECT key",
      "DEBUG SEGFAULT",
      "DECR key",
      "DECRBY key decrement",
      "DEL key [key ...]",
      "DISCARD",
      "DUMP key",
      "ECHO message",
      "EVAL script numkeys key [key ...] arg [arg ...]",
      "EVALSHA sha1 numkeys key [key ...] arg [arg ...]",
      "EXEC",
      "EXISTS key",
      "EXPIRE key seconds",
      "EXPIREAT key timestamp",
      "FLUSHALL",
      "FLUSHDB",
      "GET key",
      "GETBIT key offset",
      "GETRANGE key start end",
      "GETSET key value",
      "HDEL key field [field ...]",
      "HEXISTS key field",
      "HGET key field",
      "HGETALL key",
      "HINCRBY key field increment",
      "HINCRBYFLOAT key field increment",
      "HKEYS key",
      "HLEN key",
      "HMGET key field [field ...]",
      "HMSET key field value [field value ...]",
      "HSET key field value",
      "HSETNX key field value",
      "HVALS key",
      "INCR key",
      "INCRBY key increment",
      "INCRBYFLOAT key increment",
      "INFO",
      "KEYS pattern",
      "LASTSAVE",
      "LINDEX key index",
      "LINSERT key BEFORE|AFTER pivot value",
      "LLEN key",
      "LPOP key",
      "LPUSH key value [value ...]",
      "LPUSHX key value",
      "LRANGE key start stop",
      "LREM key count value",
      "LSET key index value",
      "LTRIM key start stop",
      "MGET key [key ...]",
      "MIGRATE host port key destination-db timeout",
      "MONITOR",
      "MOVE key db",
      "MSET key value [key value ...]",
      "MSETNX key value [key value ...]",
      "MULTI",
      "OBJECT subcommand [arguments ...]",
      "PERSIST key",
      "PEXPIRE key milliseconds",
      "PEXPIREAT key milliseconds-timestamp",
      "PING",
      "PSETEX key milliseconds value",
      "PSUBSCRIBE pattern [pattern ...]",
      "PTTL key",
      "PUBLISH channel message",
      "PUNSUBSCRIBE [pattern ...]",
      "QUIT",
      "RANDOMKEY",
      "RENAME key newkey",
      "RENAMENX key newkey",
      "RESTORE key ttl serialized-value",
      "RPOP key",
      "RPOPLPUSH source destination",
      "RPUSH key value [value ...]",
      "RPUSHX key value",
      "SADD key member [member ...]",
      "SAVE",
      "SCARD key",
      "SCRIPT EXISTS script [script ...]",
      "SCRIPT FLUSH",
      "SCRIPT KILL",
      "SCRIPT LOAD script",
      "SDIFF key [key ...]",
      "SDIFFSTORE destination key [key ...]",
      "SELECT index",
      "SET key value",
      "SETBIT key offset value",
      "SETEX key seconds value",
      "SETNX key value",
      "SETRANGE key offset value",
      "SHUTDOWN [NOSAVE|SAVE]",
      "SINTER key [key ...]",
      "SINTERSTORE destination key [key ...]",
      "SISMEMBER key member",
      "SLAVEOF host port",
      "SLOWLOG subcommand [argument]",
      "SMEMBERS key",
      "SMOVE source destination member",
      "SORT key [BY pattern] [LIMIT offset count] [GET pattern [GET pattern ...]] [ASC|DESC] [ALPHA] [STORE destination]",
      "SPOP key",
      "SRANDMEMBER key",
      "SREM key member [member ...]",
      "STRLEN key",
      "SUBSCRIBE channel [channel ...]",
      "SUNION key [key ...]",
      "SUNIONSTORE destination key [key ...]",
      "SYNC",
      "TIME",
      "TTL key",
      "TYPE key",
      "UNSUBSCRIBE [channel ...]",
      "UNWATCH",
      "WATCH key [key ...]",
      "ZADD key score member [score] [member]",
      "ZCARD key",
      "ZCOUNT key min max",
      "ZINCRBY key increment member",
      "ZINTERSTORE destination numkeys key [key ...] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]",
      "ZRANGE key start stop [WITHSCORES]",
      "ZRANGEBYSCORE key min max [WITHSCORES] [LIMIT offset count]",
      "ZRANK key member",
      "ZREM key member [member ...]",
      "ZREMRANGEBYRANK key start stop",
      "ZREMRANGEBYSCORE key min max",
      "ZREVRANGE key start stop [WITHSCORES]",
      "ZREVRANGEBYSCORE key max min [WITHSCORES] [LIMIT offset count]",
      "ZREVRANK key member",
      "ZSCORE key member",
      "ZUNIONSTORE destination numkeys key [key ...] [WEIGHTS weight [weight ...]] [AGGREGATE SUM|MIN|MAX]"
    ], {
      key: function (partial, callback) {
        const r = ['user:1', 'user:2', 'item:1', 'item:2', 'item:3', 'item:4']
          .filter(function (item) { return item.toLowerCase().indexOf(partial.toLowerCase()) === 0; });
        callback(null, r);
      }
    });

  it('DEL completer', function (done) {
    cmdparser.completer("del user", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["user:1", "user:2"],
        "user"
      ], 'command was parsed');
      done();
    });
  });

  it('CONFIG GET completer', function (done) {
    cmdparser.completer("CONFIG GE", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["GET"],
        "GE"
      ], 'command was parsed');
      done();
    });
  });

  it('BLPOP completer', function (done) {
    cmdparser.completer("BLPOP user", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["user:1", "user:2"],
        "user"
      ], 'command was parsed');
      done();
    });
  });

  it('BLPOP parser', function (done) {
    cmdparser.parse("BLPOP user:1 4", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal({
        name: 'BLPOP',
        params: {
          key: 'user:1',
          timeout: 4
        }
      }, 'command was parsed');
      done();
    });
  });

  it('ZRANGE completion', function (done) {
    cmdparser.completer("ZRANGE ", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        [ 'user:1', 'user:2', 'item:1', 'item:2', 'item:3', 'item:4' ],
        ''
      ], 'command was parsed');
      done();
    });
  });

  it('LINSERT completer', function (done) {
    cmdparser.completer("LINSERT user:1 ", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["BEFORE", "AFTER"],
        ""
      ], 'command was parsed');
      done();
    });
  });

  it('LINSERT completer hint', function (done) {
    cmdparser.completer("LINSERT user:1 B", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal([
        ["BEFORE"],
        "B"
      ], 'command was parsed');
      done();
    });
  });

  it('LINSERT parser', function (done) {
    cmdparser.parse("LINSERT user:1 BEFORE a b", function (err, results) {
      expect(err, 'no error returned').to.be.null;
      expect(results).to.deep.equal({
        name: 'LINSERT',
        params: {
          key: 'user:1',
          BEFORE: true,
          AFTER: false,
          pivot: 'a',
          value: 'b'
        }
      }, 'command was parsed');
      done();
    });
  });
});
