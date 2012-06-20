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
  var i;
  if (m) {
    commandName = m[1];
    parts.push({ op: 'commandName', name: commandName });
    var cmdParameters = m[2];
    for (i = 0; i < cmdParameters.length;) {
      if (cmdParameters[i] === '<') {
        i++;
        paramName = '';
        while (cmdParameters[i] !== '>') {
          paramName += cmdParameters[i++];
        }
        i++;
        parts.push({
          op: 'requiredParameter',
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

        var subParts = paramName
          .split(' ')
          .map(function (name) {
            if (name.indexOf('"') === 0) {
              name = name.substring(1, name.length - 1);
              return {
                op: 'literal',
                value: name
              };
            }

            return {
              op: 'requiredParameter',
              name: name
            };
          });
        parts.push({
          op: 'optionalParameters',
          parts: subParts
        });
        continue;
      }

      if (isWhitespace(cmdParameters[i])) {
        i++;
        continue;
      }

      throw new Error('Invalid command "' + cmd + '"');
    }
  } else {
    commandName = cmd;
    parts.push({ op: 'commandName', name: commandName });
  }

  for (i = 0; i < parts.length; i++) {
    if (parts[i].op === 'optionalParameters' && parts[i].parts[0].op === 'literal') {
      var startOrPartIdx = i;
      var endOrPartIdx = i;
      while (endOrPartIdx < parts.length && parts[endOrPartIdx].op === 'optionalParameters' && parts[endOrPartIdx].parts[0].op === 'literal') {
        endOrPartIdx++;
      }
      if (startOrPartIdx !== endOrPartIdx - 1) {
        var orPart = {
          op: 'optionalParameterLiteralOr',
          parts: parts.slice(startOrPartIdx, endOrPartIdx)
        };
        parts.splice(startOrPartIdx, endOrPartIdx - startOrPartIdx, orPart);
        i = startOrPartIdx - 1;
      }
    }
  }

  function doParse(str) {
    var state = {
      strIdx: 0,
      startStrIdx: 0,
      str: str,
      cmd: cmd,
      debug: false,
      result: {
        name: null,
        params: {}
      }
    };
    return parseAll(state, parts);
  }

  return {
    parse: doParse
  };
}

function isWhitespace(ch) {
  return /\s/.test(ch)
}

function skipWhitespace(state) {
  while (state.strIdx < state.str.length && isWhitespace(state.str[state.strIdx])) {
    state.strIdx++;
  }
}

function readNextWord(state) {
  var word = '';
  while (state.strIdx < state.str.length && !isWhitespace(state.str[state.strIdx])) {
    word += state.str[state.strIdx++];
  }
  return word;
}

function peekNextWord(state) {
  var word = '';
  var i = state.strIdx;
  while (i < state.str.length && !isWhitespace(state.str[i])) {
    word += state.str[i++];
  }
  return word;
}

function parseAll(state, parts) {
  if (state.debug) {
    console.log('parts', state.cmd, JSON.stringify(parts, null, '  '));
  }

  for (var partIdx = 0; partIdx < parts.length; partIdx++) {
    var part = parts[partIdx];

    if (part.op === 'commandName') {
      if (parseCommandName(state, part)) {
        continue;
      }
    }

    if (part.op === 'requiredParameter') {
      if (parseRequiredParameter(state, part)) {
        continue;
      }
    }

    if (part.op === 'optionalParameters') {
      if (parseOptionalParameters(state, part)) {
        continue;
      }
    }

    if (part.op === 'literal') {
      if (parseLiteral(state, part)) {
        continue;
      }
    }

    if (part.op === 'optionalParameterLiteralOr') {
      if (parseOptionalParameterLiteralOr(state, part)) {
        continue;
      }
    }

    if (state.debug) {
      console.log('could not parse', state);
    }
    return null;
  }

  if (state.debug) {
    console.log('parseAll ok', state);
  }
  return state.result;
}

function parseRequiredParameter(state, part) {
  if (state.debug) {
    console.log('parseRequiredParameter', state, part);
  }
  var val = '';
  while (!isWhitespace(state.str[state.strIdx]) && state.strIdx < state.str.length) {
    val += state.str[state.strIdx];
    state.strIdx++;
  }
  if (val.length === 0) {
    return false;
  }
  state.result.params[part.name] = val;
  skipWhitespace(state);
  return true;
}

function parseCommandName(state, part) {
  if (state.debug) {
    console.log('parseCommandName', state, part);
  }
  var word = readNextWord(state);
  if (word !== part.name) {
    return false;
  }
  state.result.name = part.name;
  skipWhitespace(state);
  return true;
}

function parseOptionalParameters(state, part) {
  if (state.debug) {
    console.log('parseOptionalParameters', state, part);
  }
  parseAll(state, part.parts);
  return true;
}

function parseLiteral(state, part) {
  if (state.debug) {
    console.log('parseLiteral', state, part);
  }
  var word = readNextWord(state);
  if (!word) {
    state.result.params[part.value] = false;
    return false;
  }
  if (word.toLowerCase() === part.value.toLowerCase()) {
    state.result.params[part.value] = true;
    skipWhitespace(state);
    return true;
  }
  state.result.params[part.value] = false;
  return false;
}

function parseOptionalParameterLiteralOr(state, part) {
  if (state.debug) {
    console.log('parseOptionalParameterLiteralOr', state, part);
  }
  var word = peekNextWord(state);
  var result = false;
  for (var i = 0; i < part.parts.length; i++) {
    var literalValue = part.parts[i].parts[0].value;
    if (literalValue.toLowerCase() === word.toLowerCase()) {
      if (state.debug) {
        console.log('parseOptionalParameterLiteralOr match', part.parts[i]);
      }
      if (parseAll(state, part.parts[i].parts)) {
        result = true;
      }
    } else {
      state.result.params[literalValue] = false;
    }
  }
  return result;
}