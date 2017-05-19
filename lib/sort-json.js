var vscode = require('vscode');
var sorter = require('./sort-json-utils');
var JSON5 = require('json5');

function getConfig() {
    return vscode.workspace.getConfiguration('sortJSON');
}

function getSelection(textEditor, startLine, startPos, endLine, endPos) {
    var selectedLines = [];
    for (var i = startLine; i <= endLine; ++i) {
        var text = textEditor.document.lineAt(i).text;

        // Slice end first so we don't mess up start position
        if (i === endLine) {
            text = text.slice(0, endPos);
        }
        if (i === startLine) {
            text = text.slice(startPos);
        }
        selectedLines.push(text);
    }
    return selectedLines.join('\n');
};

function findIndent(textEditor) {
    return textEditor.options.tabSize || 2;
}

function sortActiveSelection(comparator) {
    try {
        sortActiveSelectionInternal(JSON5, comparator);
        return true;
    } catch (e) {
        try {
            sortActiveSelectionInternal(JSON5, comparator);
            return true;
        } catch (e) {
            console.log(e);
            vscode.window.showWarningMessage(e.message);
            return false;
        }
    }
}

function setSelection(textEditor, startLine, startPos, endLine, endPos, sortedText) {
    textEditor.edit(function (editBuilder) {
        var range = new vscode.Range(startLine, startPos, endLine, endPos);
        editBuilder.replace(range, sortedText);
    });
}

function objectStringToJson(objectString) {
    var json = objectString
        // Change the multiple lines to one line
        .replace(/\s*(\n|\t)\s*/g, '')
        // Replace the " with '
        .replace(/"/g, `'`)
        // Add "" to all the keys and values
        .replace(/([^\{\}\[\]:,]+)/g, (match) => {
            var realMatch = match.trim(); 
            return realMatch ? `"${match.trim()}"` : realMatch
        });

    var es6ShortLandRegex = /([\{,]+)\s*("[^\{\}:,]+")\s*([\},]+)/g;
    while (json.match(es6ShortLandRegex)) {
        // Change ES6 single value to be JSON
        json = json.replace(es6ShortLandRegex, (match, $1, $2, $3) => `${$1}${$2}:${$2}${$3}`)
    }

    return json;
}

function jsonToObjectString(json, needTailingComma) {
    var objectString = json
        // remove the "" to all the keys and values
        .replace(/"([^\{\}:,]+)"/g, (match, $1) => $1);

    if (needTailingComma) {
        var tailingCommaRegex = /([^\{:,\s\t\n]+)([\s\t\n]*\})/g;

        var count = 0;
        console.log(count)
        console.log(objectString)
        console.log(objectString.match(tailingCommaRegex))
        while (objectString.match(tailingCommaRegex)) {
            objectString = objectString.replace(tailingCommaRegex, (match, $1, $2) => `${$1},${$2}`)
            count++;
            console.log(count)
            console.log(objectString)
            console.log(objectString.match(tailingCommaRegex))
        }
    }

    return objectString
}

function checkIfNeedTailingComma(objectString) {
    console.log('objectString')
    console.log(objectString)
    return objectString.match(/,[\s\t\n]*\}/);
}

function sortActiveSelectionInternal(jsonParser, sortOrder) {
    var textEditor = vscode.window.activeTextEditor;
    var selection = textEditor.selection;

    var startLine = selection.start.line;
    var startPos = selection.start.character;
    var endLine = selection.end.line;
    var endPos = selection.end.character;

    var sortOptions = getConfig();

    var selectedText = getSelection(textEditor, startLine, startPos, endLine, endPos);

    var jsonText = objectStringToJson(selectedText);

    var needTailingComma = checkIfNeedTailingComma(selectedText);

    console.log('jsonText');
    console.log(jsonText);

    var initialJSON = sorter.textToJSON(jsonParser, jsonText);
    var sortedJSON = sorter.sortJSON(initialJSON, sortOrder, sortOptions);

    var indent = findIndent(textEditor);
    var sortedJsonText = sorter.jsonToText(jsonParser, sortedJSON, indent);

    console.log('sortedJsonText');
    console.log(sortedJsonText);
    var sortedText = jsonToObjectString(sortedJsonText, needTailingComma);

    setSelection(textEditor, startLine, startPos, endLine, endPos, sortedText);
}

function reverseCompare(a, b) {
  return a < b ? 1 : -1;
}

function caseInsensitiveCompare(a, b) {
  return a.localeCompare(b, {sensitivity: 'base'});
}

exports.sortNormal = sortActiveSelection.bind(null, ['asc']);
exports.sortReverse = sortActiveSelection.bind(null, ['desc']);