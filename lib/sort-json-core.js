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

var MARK_START = String.fromCharCode(193);
var MARK_END = String.fromCharCode(201);

function generateMark(number) {
  return `${MARK_START}${number}${MARK_END}`;
}

function getMarkRegex() {
  return new RegExp(`${MARK_START}([^"]*)${MARK_END}`, 'g');
}

function getNeedReverseMarkRegex() {
  return new RegExp(`"${MARK_START}([^"]*)${MARK_END}([^"]*)"`, 'g');
}

function getReverseBackMarkRegex() {
  return new RegExp(`"([^"]*)${MARK_END}([^"]*)${MARK_START}"`, 'g');
}

function addMark(marks, value) {
  var length = marks.length;
  var mark = generateMark(length);
  marks.push(value);
  return mark;
}

function decodeMark(sortedJsonText, marks) {
  return (
    sortedJsonText
      // replace mark
      .replace(getMarkRegex(), (match, markIndex) => {
        console.log(markIndex);
        return marks[markIndex];
      })
      // replace the reverse mark
      .replace(getReverseBackMarkRegex(), (match, value, markIndex) => {
        console.log('ReverseBackMarkRegex');
        console.log(match, value, markIndex);
        return `"${marks[markIndex]}${value}"`;
      })
  );
}

function objectStringToJson(objectString, marks, autoIndent) {
  var autoIndentString = new Array(autoIndent).fill(' ').join('');

  var json = objectString
    // Add mark for end line comments
    .replace(
      /(\/\/.*)(\n|\t)\s*\}/g,
      (match, comments) => `${addMark(marks, `${comments}`)}}`
    )
    // Add mark for line comments
    .replace(/(\/\/.*)/g, comments =>
      addMark(marks, `${comments}\n${autoIndentString}`)
    )
    // Change the multiple lines to one line
    .replace(/\s*(\n|\t)\s*/g, '')
    // Replace the " with '
    .replace(/"/g, `'`)
    // Add "" to all the keys and values
    .replace(/([^\{\}\[\]:,]+)/g, match => {
      var realMatch = match.trim();
      return realMatch ? `"${match.trim()}"` : realMatch;
    })
    // reverse mark if it is at the beginning of the line
    .replace(
      getNeedReverseMarkRegex(),
      (match, markIndex, value) =>
        `"${value}${MARK_END}${markIndex}${MARK_START}"`
    );

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

  // replace the comma at the end
  objectString = objectString.replace(
    /(\/\/.*)(\n|\t)(\s*\})/g,
    (match, comments, $2, $3) => `${comments.replace(/,$/, '')}${$2}${$3}`
  );

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

  var marks = [];

  var { json, isEs6 } = objectStringToJson(selectedText, marks, autoIndent);

  var needTailingComma = checkIfNeedTailingComma(selectedText);

  console.log('jsonText');
  console.log(json);

  var initialJSON = sorter.textToJSON(jsonParser, json);
  var sortedJSON = sorter.sortJSON(initialJSON, sortOrder, sortOptions);

  var sortedJsonText = sorter.jsonToText(jsonParser, sortedJSON, indent);

  console.log(marks);

  console.log('sortedJsonText');
  console.log(sortedJsonText);
  sortedJsonText = decodeMark(sortedJsonText, marks);

  console.log('decoded text');
  console.log(sortedJsonText);

  var sortedText = jsonToObjectString(
    sortedJsonText,
    needTailingComma,
    autoIndent,
    isEs6
  );

  console.log('sortedText');
  console.log(sortedText);

  return sortedText;
}

exports.sort = selectedTextToSortedText;
