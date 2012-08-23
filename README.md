[![build status](https://secure.travis-ci.org/nearinfinity/node-cmdparser.png)](http://travis-ci.org/nearinfinity/node-cmdparser)

# cmdparser

Command parser with support for completers.

Made specifically to parse redis command syntax but can be used for other purposes as well.

# Install

```bash
$ npm install cmdparser
```

# Example

```javascript
var cmdparser = new CmdParser([
  "del <key> [key ...]",
  "dump <key>",
  "exists <key>"
], {
  key: function (partial) {
    return ["1111", "1112", "1113"];
  }
});
var results = cmdparser.completer("dump 111");
// results = [ ["1111", "1112", "1113"], "111" ]
```
