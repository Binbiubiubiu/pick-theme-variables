import * as vscode from "vscode";
import { findVariables } from "./findThemeVariables";


const lineDecoration = vscode.window.createTextEditorDecorationType({
  rangeBehavior: vscode.DecorationRangeBehavior.ClosedOpen,
});

let timeout: NodeJS.Timeout;
export function triggerUpdateLineDecorations() {
  if (timeout) {
    clearTimeout(timeout);
  }
  timeout = setTimeout(updateLineDecorations, 500);
}


/**
 * 更新标记
 */
export async function updateLineDecorations() {
  const activeEditor = vscode.window.activeTextEditor;
  if (!activeEditor) {
    return;
  }

  const currentFilename = activeEditor.document.fileName;

  const text = activeEditor.document.getText();
  // 清空上一次的保存结果
  let ranges: vscode.DecorationOptions[] = [];

  const variables = await findVariables(text, currentFilename);
  variables.map((match) => {
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
          contentText: match.variable.value,
          fontWeight: "normal",
          fontStyle: "normal",
          textDecoration: "none",
        },
      },
    };
    ranges.push(decoration);
  });
  activeEditor.setDecorations(lineDecoration,[]);
  activeEditor.setDecorations(lineDecoration, ranges);

  return lineDecoration;
}
