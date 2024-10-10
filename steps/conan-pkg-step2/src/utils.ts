import * as vscode from 'vscode';
import * as child from 'child_process';

export function checkForConan(): string | undefined {
  return checkFor('conan -v');
}

export function checkFor(cmd: string): string | undefined {
  try {
    let result = child.execSync(cmd);
    return result.toString('utf8').trim();
  } catch (error) {
    return "error: " + error;
  }
}
export async function fileExists(filepath: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(filepath);
  } catch {
    return false;
  }
  return true;
}
export async function readJsonFile(jsonFile: vscode.Uri): Promise<any> {
  const data = await vscode.workspace.fs.readFile(jsonFile);
  const readStr = Buffer.from(data).toString('utf8');
  const jsonObj = JSON.parse(readStr);
  return jsonObj;
}
export function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
  return {
    // Enable javascript in the webview
    enableScripts: true,

    // And restrict the webview to only loading content from our extension's `media` directory.
    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
  };
}
export function getSimpleHtmlPage(message: string): string {
  return `<html lang="en">
    <style>
      div.paragraph {
        text-align: center;
      }
      p.bold {
        color: #1c1cFF;
        font-size=xx-large;
     }
     p.error {
       color: #FF0000;
       font-size=x-large;
    }
    </style>${message}</html>`;
}
export function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
export function getConanProfileHtml(profiles: string) {
  return `<tr><td>
      <label for="conan_profile">Conan profile :</label>
      <td>
      <select id="conan_profile" name="conan_profile" size=1>
      ${profiles}`;
}
export function getOptionsString(values: string[], skipEmpty: boolean = true): string {
  var str = "";
  for (const text of values) {
      if (skipEmpty && text.length === 0) {
          continue;
      }
      str += "<option>" + text;
  }
  return str;
}
