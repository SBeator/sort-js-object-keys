var vscode = require('vscode');
var sorterCore = require('./sort-js-object-core');

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
}

function findIndent(textEditor) {
  return textEditor.options.tabSize || 2;
}

function sortActiveSelection(comparator) {
  try {
    sortActiveSelectionInternal(comparator);
    return true;
  } catch (e) {
    try {
      sortActiveSelectionInternal(comparator);
      return true;
    } catch (e) {
      console.log(e);
      vscode.window.showWarningMessage(e.message);
      return false;
    }
  }
}

function setSelection(
  textEditor,
  startLine,
  startPos,
  endLine,
  endPos,
  sortedText
) {
  textEditor.edit(function(editBuilder) {
    var range = new vscode.Range(startLine, startPos, endLine, endPos);
    editBuilder.replace(range, sortedText);
  });
}

function sortActiveSelectionInternal(sortOrder) {
  var textEditor = vscode.window.activeTextEditor;
  var selection = textEditor.selection;

  var startLine = selection.start.line;
  var startPos = selection.start.character;
  var endLine = selection.end.line;
  var endPos = selection.end.character;

  var selectedText = getSelection(
    textEditor,
    startLine,
    startPos,
    endLine,
    endPos
  );

  var indent = findIndent(textEditor);
  var sortedText = sorterCore.sort(selectedText, indent, sortOrder);

  setSelection(textEditor, startLine, startPos, endLine, endPos, sortedText);
}

exports.sortNormal = sortActiveSelection.bind(null, ['asc']);
exports.sortReverse = sortActiveSelection.bind(null, ['desc']);
