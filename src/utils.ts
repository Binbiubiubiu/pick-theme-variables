import * as vscode from "vscode";
import constants from "./constants";

interface ConfigurationProxy extends Pick<vscode.WorkspaceConfiguration, "get" | "update"> {
  getInstance(): vscode.WorkspaceConfiguration;
}

/**
 * 获取配置，支持从vscode和配置文件(优先)中取到配置项
 */
export const configuration: ConfigurationProxy = {
  getInstance() {
    return vscode.workspace.getConfiguration(constants.extension.name);
  },
  get<T>(section: string, defaultValue?: T): T | undefined {
    return this.getInstance().get(section, defaultValue);
  },
  update(section: string, value: any, configurationTarget = vscode.ConfigurationTarget.Global) {
    return this.getInstance().update(section, value, configurationTarget);
  },
};

export const getRootPath = () => vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
