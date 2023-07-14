// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { triggerUpdateLineDecorations } from "./variableDecorations";
import { configuration } from "./utils";
import CompletionItemProvider from "./completionItemProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("pick-theme-colors.addThemeVariablesFile", (file) => {
      const configName = "themeFilePath";
      let value = configuration.get(configName,[] as string[]);
      value = [...new Set(value).add(file.path)];
      configuration.update(configName, value, vscode.ConfigurationTarget.Workspace);
    })
  );

  let activeEditor = vscode.window.activeTextEditor;
  if (activeEditor) {
    triggerUpdateLineDecorations();
  }

  // 当 切换文档 的时候重新检测
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      activeEditor = editor;
      if (editor) {
        triggerUpdateLineDecorations();
      }
    }, null)
  );

  // 当 文档发生变化时 的时候重新检测
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateLineDecorations();
      }
    }, null)
  );

  new CompletionItemProvider().register(context)
}

// This method is called when your extension is deactivated
export function deactivate() {}
