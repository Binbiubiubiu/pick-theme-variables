import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import postcss from "postcss";
import * as postcssImport from "postcss-import";
import * as postcssLess from "postcss-less";
import * as postcssScss from "postcss-scss";
// @ts-ignore
import { isColor } from "is-color-stop";
import { configuration } from "./utils";
import resolveId from "./resolveId";

const parse = async (id: string) => {
  const ext = path.extname(id);
  try{
    const output = await postcss()
    .use(
      postcssImport({
        resolve: resolveId as any,
      })
    )
    .process(fs.readFileSync(id), {
      from: id,
      syntax: {
        ".less": postcssLess,
        ".scss": postcssScss,
      }[ext],
    });

    return output.root;
  }catch{
    return;
  }
};

export class VariableCompletionItem {
  readonly kind: vscode.CompletionItemKind;
  constructor(readonly label: string, readonly value: string) {
    this.kind = isColor(value)
      ? vscode.CompletionItemKind.Color
      : vscode.CompletionItemKind.Variable;
  }
}

export const loadThemeVariables = async () => {
  const themeFilePath = configuration.get("themeFilePath", [] as string[]);
  const variables = new Map<string, VariableCompletionItem>();
  const processValue = (key: string, value: string) => {
    value = value.trim();
    // scss !default逻辑
    if(value.endsWith("!default") && variables.has(key)){
      return;
    }
    value = value.replace("!default", "").trim();
    // 如果是变量套变量 处理
    value = variables.get(value)?.value ?? value;
    variables.set(key, new VariableCompletionItem(key, value));
  };

  for (let i = 0; i < themeFilePath.length; i++) {
    const id = themeFilePath[i];
    if (!fs.existsSync(id)) continue;
    const root = await parse(id);
    if(!root)continue;
    root.walkAtRules((atRule) => {
      // @ts-ignore
      if (atRule.variable) {
        // @ts-ignore
        processValue(`@${atRule.name}`, atRule.value);
      }
    });
    root.walkDecls((decl) => {
      if (decl.variable) {
        processValue(decl.prop, decl.value);
      }
    });
  }
  return variables;
};
