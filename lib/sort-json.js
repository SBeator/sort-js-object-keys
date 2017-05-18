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
    return objectString
        // Change the multiple lines to one line
        .replace(/\n|\t/g, '')
        // Replace the " with '
        .replace(/"/g, `'`)
        // Add "" to all the keys and values
        .replace(/([^\{\}:,]+)/g, (match) => {
            var realMatch = match.trim(); 
            return realMatch ? `"${match.trim()}"` : realMatch
        })
        // Change ES6 single value to be JSON
        .replace(/,\s*("[^\{\}:,]+")\s*,/g, (match, $1) => `,${$1}:${$1},`)
}

function jsonToObjectString(json) {
    return json
        // remove the "" to all the keys and values
        .replace(/"([^\s\{\}:,]+)"/g, (match, $1) => $1);
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

    console.log('jsonText');
    console.log(jsonText);

    var initialJSON = sorter.textToJSON(jsonParser, jsonText);
    var sortedJSON = sorter.sortJSON(initialJSON, sortOrder, sortOptions);

    var indent = findIndent(textEditor);
    var sortedJsonText = sorter.jsonToText(jsonParser, sortedJSON, indent);

    console.log('sortedJsonText');
    console.log(sortedJsonText);
    var sortedText = jsonToObjectString(sortedJsonText);
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