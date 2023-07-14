import * as vscode from "vscode";
import { findVariables } from "./findThemeVariables";

/**
 * 中文的标记，红框样式
 */
export function getLineDecoration(): vscode.TextEditorDecorationType {
  return vscode.window.createTextEditorDecorationType({
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
  });
}

let timeout: NodeJS.Timeout;
let prevLineDecoration: vscode.TextEditorDecorationType | undefined;
export function triggerUpdateLineDecorations() {
  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    const activeEditor = vscode.window.activeTextEditor;
    if (prevLineDecoration) {
      activeEditor!.setDecorations(prevLineDecoration, []);
    }
    const lineDecoration = updateLineDecorations();
    prevLineDecoration = lineDecoration;
  }, 500);
}

/**
 * 更新标记
 */
export function updateLineDecorations() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return;
  }

  const currentFilename = activeEditor.document.fileName;
  const lineDecoration = getLineDecoration();

  const text = activeEditor.document.getText();
  // 清空上一次的保存结果
  let targetStrs = [];
  let variables: vscode.DecorationOptions[] = [];

  targetStrs = findVariables(text, currentFilename);
  targetStrs.map((match) => {
    const isColor = match.variable.kind === vscode.CompletionItemKind.Color;
    const line = match.range.end.line;
    const lastCol = activeEditor.document.lineAt(line).range.end.character;
    const decoration: vscode.DecorationOptions = {
      range: new vscode.Range(
        new vscode.Position(line, lastCol),
        new vscode.Position(line, lastCol)
      ),
      renderOptions: {
        after: {
          margin: "0 0 0 3em",
          color: isColor ? match.variable.value : "#999999",
          contentText: ' ' + match.variable.value,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecoration: "none",
        },
      },
    };
    variables.push(decoration);
  });
  activeEditor.setDecorations(lineDecoration, variables);

  return lineDecoration;
}
