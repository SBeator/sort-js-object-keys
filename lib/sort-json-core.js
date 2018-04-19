var sorter = require('./sort-json-utils');

function getAutoIndent(selectedText, indent) {
  var lines = selectedText.split('\n');
  var autoIndent = 0;

  for (var i = lines.length - 1; i >= 0; i--) {
    if (lines[i].match(/^([\t\s]*)\}$/)) {
      var spaceAndTab = RegExp.$1;
      autoIndent = spaceAndTab.split('').reduce((previous, current) => {
        if (current == '\t') {
          previous += indent;
        } else {
          previous++;
        }
        return previous;
      }, 0);
      break;
    }

    if (lines[i].match(/[^\s]/)) {
      break;
    }
  }

  return autoIndent;
}

function objectStringToJson(objectString) {
  var json = objectString
    // Change the multiple lines to one line
    .replace(/\s*(\n|\t)\s*/g, '')
    // Replace the " with '
    .replace(/"/g, `'`)
    // Add "" to all the keys and values
    .replace(/([^\{\}\[\]:,]+)/g, match => {
      var realMatch = match.trim();
      return realMatch ? `"${match.trim()}"` : realMatch;
    });

  var es6ShortLandRegex = /([\{,]+)\s*("[^\{\}:,]+")\s*([\},]+)/g;
  var isEs6 = false;
  while (json.match(es6ShortLandRegex)) {
    // Change ES6 single value to be JSON
    json = json.replace(
      es6ShortLandRegex,
      (match, $1, $2, $3) => `${$1}${$2}:${$2}${$3}`
    );
    isEs6 = true;
  }

  return {
    json,
    isEs6,
  };
}

function jsonToObjectString(json, needTailingComma, autoIndent, isEs6) {
  var objectString = json
    // remove the "" to all the keys and values
    .replace(/"([^\{\}:,]+)"/g, (match, $1) => $1);

  if (autoIndent) {
    var objectStringLines = objectString.split('\n');
    var autoIndentString = new Array(autoIndent).fill(' ').join('');

    for (var i = 1; i < objectStringLines.length; i++) {
      objectStringLines[i] = autoIndentString + objectStringLines[i];
    }

    objectString = objectStringLines.join('\n');
  }

  if (needTailingComma) {
    var tailingCommaRegex = /([^\{:,\s\t\n]+)([\s\t\n]*[\]\}])/g;
    while (objectString.match(tailingCommaRegex)) {
      objectString = objectString.replace(
        tailingCommaRegex,
        (match, $1, $2) => `${$1},${$2}`
      );
    }
  }

  if (isEs6) {
    console.log(`isEs6: ${isEs6}`);

    objectString = objectString
      .split('\n')
      .map(line => {
        console.log(`line: ${line}`);

        var keyValuePair = line.replace(/,[\s]*/, '').split(':');
        console.log(`keyValuePair: ${keyValuePair}`);
        console.log(
          `keyValuePair[0].trim(): ${keyValuePair[0] && keyValuePair[0].trim()}`
        );
        console.log(
          `keyValuePair[1].trim(): ${keyValuePair[1] && keyValuePair[1].trim()}`
        );

        if (
          keyValuePair.length === 2 &&
          keyValuePair[0].trim() === keyValuePair[1].trim()
        ) {
          console.log(`return: ${`${keyValuePair[0]},`}`);
          return `${keyValuePair[0]},`;
        } else {
          console.log(`origin return: ${line}`);
          return line;
        }
      })
      .join('\n');
  }

  return objectString;
}

function checkIfNeedTailingComma(objectString) {
  console.log('objectString');
  console.log(objectString);
  return objectString.match(/,[\s\t\n]*\}/);
}

function selectedTextToSortedText(
  selectedText,
  indent,
  jsonParser,
  sortOrder,
  sortOptions
) {
  var autoIndent = getAutoIndent(selectedText, indent);

  var { json, isEs6 } = objectStringToJson(selectedText);

  var needTailingComma = checkIfNeedTailingComma(selectedText);

  console.log('jsonText');
  console.log(json);

  var initialJSON = sorter.textToJSON(jsonParser, json);
  var sortedJSON = sorter.sortJSON(initialJSON, sortOrder, sortOptions);

  var sortedJsonText = sorter.jsonToText(jsonParser, sortedJSON, indent);

  console.log('sortedJsonText');
  console.log(sortedJsonText);
  var sortedText = jsonToObjectString(
    sortedJsonText,
    needTailingComma,
    autoIndent,
    isEs6
  );

  return sortedText;
}

exports.sort = selectedTextToSortedText;
