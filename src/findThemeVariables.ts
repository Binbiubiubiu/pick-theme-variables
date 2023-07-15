import * as vscode from "vscode";
import { parse as lessParse } from "postcss-less";
import { parse as vueParse } from "@vue/compiler-sfc";
import { VariableCompletionItem, loadThemeVariables } from "./loadThemeVariables";

export interface VarablesMatch {
  range: vscode.Range;
  variable: VariableCompletionItem;
}

const isVairable = (v: string) => /^(var\(|@|\$)/.test(v);
const getThemeVariableName = (value: string) => {
  if (value.startsWith("var(")) {
    return value.substring(4, value.length - 1);
  }
  return value;
};

function findTextInCss(code: string, baseLine = 0) {
  const matches: VarablesMatch[] = [];
  const root = lessParse(code);

  root.walkDecls((decl) => {
    if (!decl.source || !isVairable(decl.value)) return;
    const { source } = decl;
    const start = decl.positionInside((decl.prop + decl.raw("between")).length);
    const range = new vscode.Range(
      new vscode.Position(start.line - 1, start.column - 1).translate(baseLine),
      new vscode.Position(source.end!.line - 1, source.end!.column - 1).translate(baseLine)
    );
    const key = getThemeVariableName(decl.value);
    const variable = variableMap.get(key);
    if (variable) {
      matches.push({
        range,
        variable,
      });
    }
  });
  return matches;
}

function findTextInVue(code: string) {
  const matches: VarablesMatch[] = [];
  const sfcParseResult = vueParse(code);
  const styles = sfcParseResult.descriptor.styles;
  styles.forEach((style) => {
    const ms = findTextInCss(style.content, style.loc.start.line - 1);
    matches.push(...ms);
  });
  return matches;
}

export let variableMap: Map<string, VariableCompletionItem>;
export async function findVariables(code: string, fileName: string) {
  variableMap = await loadThemeVariables();


  if (fileName.endsWith(".vue")) {
    return findTextInVue(code);
  }
  return findTextInCss(code);
}
