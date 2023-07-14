import * as vscode from "vscode";
import * as fs from "fs";
import { parse as lessParse } from "postcss-less";
// @ts-ignore
import { isColor } from "is-color-stop";
import { configuration } from "./utils";

export class VariableCompletionItem {
  readonly kind: vscode.CompletionItemKind;
  constructor(readonly label: string, readonly value: string) {
    this.kind = isColor(value)
      ? vscode.CompletionItemKind.Color
      : vscode.CompletionItemKind.Variable;
  }
}

export const loadThemeVariables = () => {
  const themeFilePath = configuration.get("themeFilePath", [] as string[]);
  const variables: Array<VariableCompletionItem> = [];
  themeFilePath.forEach((file) => {
    if (!fs.existsSync(file)) return;
    const root = lessParse(fs.readFileSync(file));
    root.walkAtRules((atRule) => {
      // @ts-ignore
      if (atRule.variable) {
        // @ts-ignore
        variables.push(new VariableCompletionItem(`@${atRule.name}`, atRule.value));
      }
    });
    root.walkDecls((decl) => {
      if (decl.variable) {
        variables.push(new VariableCompletionItem(decl.prop, decl.value));
      }
    });
  });
  return variables;
};

export default class CompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(): vscode.ProviderResult<
    vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>
  > {
    return loadThemeVariables().map((item) => {
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
