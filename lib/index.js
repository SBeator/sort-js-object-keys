var vscode = require('vscode');
var sortJSON = require('./sort-js-object');

function activate(context) {
  var commands = [
    vscode.commands.registerCommand(
      'sortJsObjectKeys.sortJsObjectKeys',
      sortJSON.sortNormal
    ),
    vscode.commands.registerCommand(
      'sortJsObjectKeys.sortJsObjectKeysReverse',
      sortJSON.sortReverse
    ),
  ];

  commands.forEach(function(command) {
    context.subscriptions.push(command);
  });
}

exports.activate = activate;
