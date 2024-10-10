import * as vscode from 'vscode';
import { getWebviewOptions, getNonce, getConanProfileHtml, getOptionsString } from './utils';

export class ProjectSettingsView implements vscode.WebviewViewProvider {

    public static readonly viewType = 'mo.manageProjectSettings';
    public static settings: any | undefined;
    public static conanProfiles: string[] = [];
    private _view?: vscode.WebviewView;

    private static _viewResolved?: vscode.WebviewView;
    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        ProjectSettingsView._viewResolved = this._view = webviewView;
        webviewView.webview.options = getWebviewOptions(this._extensionUri);
        ProjectSettingsView.conanProfiles = ["1st", "2nd"];
        let workspaceFolder = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri : undefined;
        // if (workspaceFolder) {
        //     ProjectSettingsView.confFile = vscode.Uri.joinPath(workspaceFolder, getTsnConfigFileName());
        // }
        webviewView.webview.html = ProjectSettingsView._getHtmlForWebview(webviewView.webview, this._extensionUri);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            console.log(data.type);
        });
    }

    private static _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.joinPath(extensionUri, 'media', 'main.js');

    // And the uri we use to load this script in the webview
    const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

    // Do the same for the stylesheet.
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));
    let profiles = getOptionsString(ProjectSettingsView.conanProfiles);

    const profilesStr = getConanProfileHtml(profiles);
    const nonce = getNonce();
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <!--
            Use a content security policy to only allow loading styles from our extension directory,
            and only allow scripts that have a specific nonce.
            (See the 'webview-sample' extension sample for img-src content security policy examples)
        -->
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${styleUri}" rel="stylesheet">

        <title>Project settings</title>
        <script nonce="${nonce}" src="${scriptUri}">
        </script>
        </head>
        <body>
        <table>
        <tr><td>
        <label for="build_type">Build Type:</label>
        <td>
        <select id="build_type" name="build_type" size=1>
        <tr><td>
        ${profilesStr}
        <tr><td>
        <td>
    <tr><td>
    <label for="project_path">TS native custom seed:</label>
    <td>
    <select id="tsnative_use_custom_seed" name="tsnative_use_custom_seed" size=1>
    <option>true
    <option>false
    <!--input type=button id="selectFolder" value="Select folder">
    <td>
    <input id="project_path" name="project_path" size=24><br>
    <tr><td>
    <input type=button id="Create" value="Create project"-->
    <tr><th colspan=3>
    <label id="status">
    </table>
    <script nonce="${nonce}">
    init();
    </script>
    </body>
    </html>`;
}
}