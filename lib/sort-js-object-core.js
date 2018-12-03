const parse = require('@babel/parser').parse;
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

function getObjectContainer(object) {
  let objectContainer = null;

  if (object.properties) {
    objectContainer = object;
  } else if(object.expression && object.expression.properties) {
    objectContainer = object.expression;
  }

  return objectContainer;
}

function sortObjectNested(object, sortOrder) {
  const objectContainer = getObjectContainer(object);
  if (!objectContainer) {
    return;
  }

  sortObject(objectContainer, sortOrder);

  objectContainer.properties.forEach(property => {
    if (property.value.type === 'ObjectExpression' || property.value.type === 'TSAsExpression') {
      sortObjectNested(property.value, sortOrder);
    } else if (property.value.type === 'ArrayExpression') {
      property.value.elements.forEach(element => {
        sortObjectNested(element, sortOrder);
      })
    }
  })
}

function sortObject(object, sortOrder) {
  object.properties = object.properties.sort((a, b) => {
    if (!a.key) {
      return 1;
    }

    if (!b.key) {
      return -1;
    }

    const aKey = a.key.name || a.key.value || '';
    const bKey = b.key.name || b.key.value || '';
    const result = aKey.localeCompare(bKey, undefined, { numeric: true });

    if (result !== 0 || !aKey || a.key.name && b.key.name) {
      return result;
    }
    return a.key.name ? -1 : 1;
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
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript']
    });
  } catch (e) {
    throw { message: 'Please make sure your selected text is a JS object!' };
  }

  let object = ast.program.body[0].declarations[0].init;

  const objectContainer = getObjectContainer(object);

  if (ast.program.body.length > 1 || !objectContainer) {
    throw { message: 'Please make sure your selected text is a JS object!' };
  }

  sortObjectNested(object, sortOrder);

  let sortedText = generate.default(ast, {}, code).code;

  sortedText = swithCorrectIndent(sortedText, indent);
  sortedText = removeWrapper(sortedText, declarePrefix);
  sortedText = addAutoIndent(sortedText, autoIndent);

  return sortedText;
}

exports.sort = selectedTextToSortedText;
