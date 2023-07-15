import * as vscode from "vscode";
import { variableMap } from "./findThemeVariables";

export default class CompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    return [...variableMap.values()].map((item) => {
      const completionItem = new vscode.CompletionItem(
        { label: item.label, description: item.value },
        item.kind
      );
      completionItem.documentation = item.value;
      return completionItem;
    });
  }

  register(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.languages.registerCompletionItemProvider(["css", "less", "scss", "vue"], this)
    );
  }
}
