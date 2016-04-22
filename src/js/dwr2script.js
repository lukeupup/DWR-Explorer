(function () {
  // TODO: exception handling
  'use strict';
  window.dwr2script = {};

  var escapeQuote = function (str) {
    return str.replace(/"/g, '\\"');
  };
  var makeSelfExecutingFunction = function (script) {
    return '(function(){' + script + '})();';
  };
  var makeScriptRightValue = function (str) {
    var rightValueRegEx = /^(\w+)\:(.*)/;
    var match = str.match(rightValueRegEx);
    if (!match) {
      throw 'Unexpected DWR request body format: cannot parse the expression after "=": ' + str;
    }
    var scriptRightValue = 'null';
    var type = match[1];
    var expression = match[2];
    if (!expression && type.toLowerCase() !== 'string') {
      throw 'Unexpected DWR request body format: empty expression';
    }
    switch (type) {
      case 'null':
      case 'boolean':
      case 'Boolean':
      case 'number':
      case 'Number':
        scriptRightValue = expression;
        break;
      case 'string':
      case 'String':
      // default is a unexpected type, for now we treat it as string.
      case 'default':
        scriptRightValue = '"' + escapeQuote(decodeURIComponent(expression)) + '"';
        break;
      case 'Date:':
        scriptRightValue = 'new Date(' + expression + ')';
        break;
      case 'reference':
        scriptRightValue = expression.replace('-', '_');
        break;
      case 'Array':
        scriptRightValue = expression.replace(/reference:(\w+)\-(\w+)/g, '$1_$2');
        break;
      case 'XML':
        scriptRightValue = 'new DOMParser().parseFromString("' + escapeQuote(expression) + '", "text/xml").documentElement';
        break;
      default:
        if (/^Object_/.test(type)) {
          scriptRightValue = decodeURIComponent(expression).replace(/reference:(\w+)\-(\w+)/g, '$1_$2');
        } else {
          scriptRightValue = 'null';
          throw 'Unexpected DWR request body format: unexpected type: ' + type;
        }
    }
    return scriptRightValue;
  };
  var makeScriptLine = function (line, params) {
    var codeRegEx = /^(c\d+)\-((e|param)\d+)=(.+)/;
    var match = line.match(codeRegEx);
    var scriptLine = '';
    if (match) {
      scriptLine = 'var ' + match[1] + '_' + match[2] + '=' +
        makeScriptRightValue(match[4]); 
      if (match[3] === 'param') {
        params.push(match[1] + '_' + match[2]);
      }
    }
    return scriptLine;
  };

  var transformRequest = function (requestBody) {
    var lines = requestBody.split('\n');
    var scriptLines = [];
    var returnParams = [];
    // TODO: considering there could be multiple calls, it's better to have a map here.
    var params = [];
    lines.forEach(function (line) {
      scriptLines.push(makeScriptLine(line, params));
    });
    scriptLines.push('return [' + params.join(',') + '];');
    var script = scriptLines.join(';');
    return makeSelfExecutingFunction(script);
  };

  window.dwr2script.transformRequest = transformRequest;

  var transformResponse = function (responseBody) {
    var script = responseBody
      .replace(/throw.*\r/, '')
      .replace(/dwr\.engine\.(_remoteHandleCallback|_remoteHandleException)\(('\d+'),('\d+'),(.*)\)/, 'return $4');
    return makeSelfExecutingFunction(script);
  };

  window.dwr2script.transformResponse = transformResponse;

})();