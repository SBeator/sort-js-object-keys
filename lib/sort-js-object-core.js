const babylon = require('babylon');
const generate = require('@babel/generator');

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

function checkIfNeedTailingComma(objectString) {
  return objectString.match(/,[\s\t\n]*\}/);
}

function addAutoIndent(text, autoIndent) {
  const autoIndentString = new Array(autoIndent).fill(' ').join('');
  const lines = text.split('\n');

  return [
    lines[0],
    ...lines
      .filter((line, index) => index > 0)
      .map(line => `${autoIndentString}${line}`),
  ].join('\n');
}

function addTaillingComma(sortedText, needTailingComma) {
  if (needTailingComma) {
    var tailingCommaRegex = /([^\{:,\s\t\n]+)([\s\t\n]*[\]\}])/g;
    while (sortedText.match(tailingCommaRegex)) {
      sortedText = sortedText.replace(
        tailingCommaRegex,
        (match, $1, $2) => `${$1},${$2}`
      );
    }
  }

  return sortedText;
}

function swithCorrectIndent(sortedText, indent) {
  return sortedText.replace(/  /g, new Array(indent).fill(' ').join(''));
}

function removeWrapper(sortedText, declarePrefix) {
  return sortedText.slice(declarePrefix.length).replace(/;$/, '');
}

function sortObject(object, sortOrder) {
  object.properties = object.properties.sort((a, b) => {
    if (!a.key) {
      return 1;
    }

    if (!b.key) {
      return -1;
    }

    return a.key.name
      ? b.key.name
        ? a.key.name.localeCompare(b.key.name)
        : 1
      : b.key.name
        ? -1
        : a.key.value.localeCompare(b.key.value);
  });

  if (sortOrder && sortOrder.indexOf('desc') >= 0) {
    object.properties = object.properties.reverse();
  }
}

function selectedTextToSortedText(selectedText, indent, sortOrder) {
  var autoIndent = getAutoIndent(selectedText, indent);

  const declarePrefix = 'const a = ';
  let code = `${declarePrefix}${selectedText}`;

  let ast;

  try {
    ast = babylon.parse(code, {
      sourceType: 'module',
      plugins: ['objectRestSpread'],
    });
  } catch (e) {
    throw { message: 'Please make sure your selected text is a JS object!' };
  }

  let object = ast.program.body[0].declarations[0].init;

  if (ast.program.body.length > 1 || object.type !== 'ObjectExpression') {
    throw { message: 'Please make sure your selected text is a JS obejct!' };
  }

  sortObject(object, sortOrder);

  let sortedText = generate.default(ast, {}, code).code;

  sortedText = swithCorrectIndent(sortedText, indent);
  sortedText = removeWrapper(sortedText, declarePrefix);
  sortedText = addAutoIndent(sortedText, autoIndent);

  return sortedText;
}

exports.sort = selectedTextToSortedText;
