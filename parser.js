'use strict';

var CmdParser = module.exports = function (commands, completers) {
  this._commands = commands.map(parseCommand);
  this._completers = completers;
};

CmdParser.prototype.parse = function (str) {
  var matches = [];
  this._commands.forEach(function (cmd) {
    var r = cmd.parse(str);
    if (r) {
      matches.push(r);
    }
  });
  if (matches.length === 0) {
    return null;
  }
  if (matches.length === 1) {
    return matches[0];
  }
  throw new Error('Multiple matches [' + JSON.stringify(matches) + '] for string "' + str + '".');
};

CmdParser.prototype.completer = function (str) {
  var self = this;
  var matches = [];
  this._commands.forEach(function (cmd) {
    var r = cmd.completer(str, self._completers);
    if (r) {
      matches.push(r);
    }
  });
  if (matches.length === 0) {
    return null;
  }
  var bestPartial = matches[0].partial; // todo find a better way
  var results = [
    [],
    bestPartial
  ];
  matches.forEach(function (m) {
    if (m.partial.toLowerCase() === bestPartial.toLowerCase()) {
      if (m.value instanceof Array) {
        results[0] = results[0].concat(m.value);
      } else {
        results[0].push(m.value);
      }
    }
  });
  return results;
};

function parseCommand(cmd) {
  var debug = false;

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
      if (cmdParameters[i] === '[') {
        i++;
        paramName = '';
        while (cmdParameters[i] !== ']') {
          paramName += cmdParameters[i++];
        }
        i++;

        var subParts = paramName.split(' ');
        var repeat = false;
        if (subParts[subParts.length - 1] === '...') {
          repeat = true;
          subParts.splice(subParts.length - 1);
        }

        subParts = subParts.map(function (name) {
          if (name.toUpperCase() === name) {
            return {
              op: 'literal',
              names: name.split('|')
            };
          }

          return {
            op: 'requiredParameter',
            name: name
          };
        });
        parts.push({
          repeat: repeat,
          op: 'optionalParameters',
          parts: subParts
        });
        continue;
      }

      if (isWhitespace(cmdParameters[i])) {
        i++;
        continue;
      }

      paramName = '';
      while (i < cmdParameters.length && !isWhitespace(cmdParameters[i])) {
        paramName += cmdParameters[i++];
      }
      if (paramName.toUpperCase() === paramName) {
        parts.push({
          op: 'literal',
          names: paramName.split('|')
        });
      } else {
        parts.push({
          op: 'requiredParameter',
          name: paramName
        });
      }
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
      debug: debug,
      result: {
        name: null,
        params: {}
      }
    };
    return parseAll(state, parts);
  }

  function doCompleter(str, completers) {
    var state = {
      completers: completers,
      strIdx: 0,
      startStrIdx: 0,
      str: str,
      cmd: cmd,
      debug: debug,
      result: {
        name: null,
        params: {}
      }
    };
    parseAll(state, parts);
    return state.completer;
  }

  return {
    parse: doParse,
    completer: doCompleter
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
  if (state.str[state.strIdx] === '"') {
    state.strIdx++;
    while (state.strIdx < state.str.length && state.str[state.strIdx] !== '"') {
      if (state.str[state.strIdx] === '\\') {
        state.strIdx++;
        word += state.str[state.strIdx++];
      } else {
        word += state.str[state.strIdx++];
      }
    }
    state.strIdx++;
  } else {
    while (state.strIdx < state.str.length && !isWhitespace(state.str[state.strIdx])) {
      word += state.str[state.strIdx++];
    }
  }
  return word;
}

function peekNextWord(state) {
  var saveStrIdx = state.strIdx;
  var word = readNextWord(state);
  state.strIdx = saveStrIdx;
  return word;
}

function isEndOfString(state) {
  return state.str.length === state.strIdx;
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
    console.log('parseAll ok', JSON.stringify(state, null, '  '));
  }
  return state.result;
}

function parseRequiredParameter(state, part) {
  if (state.debug) {
    console.log('parseRequiredParameter', state, part);
  }
  var val = readNextWord(state);
  if (val.length === 0) {
    return false;
  }
  if (state.completers && state.completers[part.name]) {
    state.completer = {
      partial: val,
      value: state.completers[part.name](val)
    };
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
  if (word.toLowerCase() !== part.name.toLowerCase()) {
    if (part.name.toLowerCase().indexOf(word.toLowerCase()) === 0 && isEndOfString(state)) {
      state.completer = {
        partial: word,
        value: part.name
      };
    }
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
  if (part.repeat) {
    var saveResults = state.result;
    state.result = {params: {}};
    while (parseAll(state, part.parts)) {
      if (state.debug) {
        console.log('repeat', state);
      }
      mergeResultsAsArrays(saveResults, state.result);
    }
    state.result = saveResults;
  } else {
    parseAll(state, part.parts);
  }
  return true;
}

function parseLiteral(state, part) {
  if (state.debug) {
    console.log('parseLiteral', state, part);
  }

  var i;
  for (i = 0; i < part.names.length; i++) {
    state.result.params[part.names[i]] = false;
  }

  var word = readNextWord(state);
  if (!word) {
    state.completer = {
      partial: word,
      value: part.names
    };

    part.names.forEach(function (name) {
      state.result.params[name] = false;
    });
    return false;
  }

  for (i = 0; i < part.names.length; i++) {
    if (word.toLowerCase() === part.names[i].toLowerCase()) {
      state.result.params[part.names[i]] = true;
      skipWhitespace(state);
      return true;
    }
  }

  if (isEndOfString(state)) {
    var matches = [];
    for (i = 0; i < part.names.length; i++) {
      if (part.names[i].toLowerCase().indexOf(word.toLowerCase()) === 0) {
        matches.push(part.names[i]);
      }
    }

    if (matches.length > 0) {
      state.completer = {
        partial: word,
        value: matches
      };
    }
  }
  return false;
}

function parseOptionalParameterLiteralOr(state, part) {
  if (state.debug) {
    console.log('parseOptionalParameterLiteralOr', state, part);
  }
  var word = peekNextWord(state);
  var result = false;
  for (var i = 0; i < part.parts.length; i++) {
    for (var n = 0; n < part.parts[i].parts[0].names.length; n++) {
      var literalValue = part.parts[i].parts[0].names[n];
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
  }
  return result;
}

function mergeResultsAsArrays(dest, src) {
  for (var key in src.params) {
    var val = src.params[key];
    if (dest.params[key] instanceof Array) {
      dest.params[key].push(val);
    } else if (dest.params[key]) {
      dest.params[key] = [dest.params[key], val];
    } else {
      dest.params[key] = [val];
    }
  }
}