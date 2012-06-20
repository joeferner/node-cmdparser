'use strict';

var CmdParser = module.exports = function (commands) {
  this._commands = commands.map(parseCommand);
};

CmdParser.prototype.parse = function (str) {
  var matches = [];
  this._commands.forEach(function (cmd) {
    matches.push(cmd.parse(str));
  });
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0];
  }
  throw new Error('Multiple matches [' + matches + '] for string "' + str + '".');
};

function parseCommand(cmd) {
  var m = cmd.match(/^(.*?)\s(.*)/);
  var commandName;
  var parts = [];
  var paramName;
  if (m) {
    commandName = m[1];
    parts.push({ type: 'commandName', name: commandName });
    var cmdParameters = m[2];
    for (var i = 0; i < cmdParameters.length;) {
      if (cmdParameters[i] === '<') {
        i++;
        paramName = '';
        while (cmdParameters[i] !== '>') {
          paramName += cmdParameters[i++];
        }
        i++;
        parts.push({
          type: 'requiredParameter',
          name: paramName
        });
        continue;
      }

      if (cmdParameters[i] === '[') {
        i++;
        paramName = '';
        while (cmdParameters[i] !== ']') {
          paramName += cmdParameters[i++];
        }
        i++;
        parts.push({
          type: 'optionalParameter',
          name: paramName
        });
        continue;
      }

      if (isWhitespace(cmdParameters[i])) {
        i++;
        continue;
      }
    }
  } else {
    commandName = cmd;
    parts.push({ type: 'commandName', name: commandName });
  }

  //console.log(parts);

  return {
    parse: function (str) {
      var val;
      var result = {
        name: null,
        params: {}
      };
      var strIdx = 0;
      var i;
      for (var partIdx = 0; partIdx < parts.length; partIdx++) {
        var part = parts[partIdx];

        if (part.type === 'commandName') {
          for (i = 0; i < part.name.length; i++) {
            if (part.name[i] === str[strIdx]) {
              strIdx++;
              continue;
            }
            return null;
          }
          result.name = part.name;
          skipWhitespace();
          continue;
        }

        if (part.type === 'requiredParameter') {
          val = '';
          while (!isWhitespace(str[strIdx]) && strIdx < str.length) {
            val += str[strIdx];
            strIdx++;
          }
          result.params[part.name] = val;
          skipWhitespace();
          continue;
        }

        if (part.type === 'optionalParameter') {
          val = '';
          while (!isWhitespace(str[strIdx]) && strIdx < str.length) {
            val += str[strIdx];
            strIdx++;
          }
          result.params[part.name] = val.length > 0 ? val : null;
          skipWhitespace();
          continue;
        }

        return null;
      }

      function skipWhitespace() {
        while (isWhitespace(str[strIdx]) && strIdx < str.length) {
          strIdx++;
        }
      }

      return result;
    }
  };
}

function isWhitespace(ch) {
  return /\s/.test(ch)
}

