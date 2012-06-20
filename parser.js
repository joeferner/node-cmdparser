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
  var m = cmd.match(/^(.*?)\s/);
  var commandName = m ? m[1] : cmd;

  return {
    parse: function (str) {
      var paramName;
      var paramValue;
      var result = {
        name: commandName,
        params: {}
      };
      var strIdx = 0;
      for (var cmdIdx = 0; cmdIdx < cmd.length;) {
        // parse required parameter
        if (cmd[cmdIdx] === '<') {
          cmdIdx++;
          paramName = '';
          while (cmd[cmdIdx] !== '>') {
            paramName += cmd[cmdIdx++];
          }
          cmdIdx++;
          paramValue = '';
          while (!isWhitespace(str[strIdx]) && strIdx < str.length) {
            paramValue += str[strIdx++];
          }
          result.params[paramName] = paramValue;
          continue;
        }

        // parse optional parameter
        if (cmd[cmdIdx] === '[') {
          cmdIdx++;
          var paramName = '';
          while (cmd[cmdIdx] !== ']') {
            paramName += cmd[cmdIdx++];
          }
          cmdIdx++;
          paramValue = '';
          while (!isWhitespace(str[strIdx]) && strIdx < str.length) {
            paramValue += str[strIdx++];
          }
          result.params[paramName] = paramValue;
          continue;
        }

        if (cmd[cmdIdx] === ' ' && isWhitespace(str[strIdx])) {
          cmdIdx++;
          while (isWhitespace(str[strIdx])) {
            strIdx++;
          }
          continue;
        }

        // parse string match
        if (str[strIdx] === cmd[cmdIdx]) {
          cmdIdx++;
          strIdx++;
          continue;
        }

        return null;
      }
      return result;
    }
  };
}

function isWhitespace(ch) {
  return /\s/.test(ch)
}

