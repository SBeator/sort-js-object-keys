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
        sortActiveSelectionInternal(JSON, comparator);
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
        .replace(/(,)[\s\n]*}/g, (match, $1) => match.replace(',', ''))
        .split('\n')
        .map((line) => line.replace(/([^\s\{\}:,]+)/g, match => `"${match}"`))
        .join('\n');
}

function jsonToObjectString(json) {
    return json.replace(/"([^\s\{\}:,]+)"/g, (match, $1) => $1);
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

    var jsonText = objectStringToJson(selectedText)

    var initialJSON = sorter.textToJSON(jsonParser, jsonText);
    var sortedJSON = sorter.sortJSON(initialJSON, sortOrder, sortOptions);

    var indent = findIndent(textEditor);
    var sortedJsonText = sorter.jsonToText(jsonParser, sortedJSON, indent);

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