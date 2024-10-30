import * as vscode from 'vscode';
import { checkForConan, getSimpleHtmlPage, getWebviewOptions } from './utils';

export class CheckInfoView2 implements vscode.WebviewViewProvider {
    public static readonly viewType = "mo.sysInfo";
    public static message: string = '';
    private _view?: vscode.WebviewView;
    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

    public static badgeTreeView?: vscode.TreeView<any>;
    public static _checkOk = false;

    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;
        webviewView.webview.options = getWebviewOptions(this._extensionUri);
        let message = '<p>Preparing system info...';
        webviewView.webview.html = getSimpleHtmlPage(message);
        console.log("Checking from info on resolveWebviewView...");
        let ok = await this.runCheck();
    }
    public async runCheck(): Promise<boolean> {
        if (this._view === undefined)
        {
            return false;
        }
        let webviewView = this._view;
        let checkOk = true;
        let conanCheck = checkForConan();
        if (conanCheck === undefined || conanCheck.startsWith('error:')) {
            let message2 = 'Conan not found on your machine"';
            webviewView.webview.html = getSimpleHtmlPage("<p color=red>" + message2);
            let answer = vscode.window.showWarningMessage("Conan not found, you must install it", "OK");
            webviewView.webview.html = getSimpleHtmlPage("<p color=red>Cannot proceed without conan");
            checkOk = false;
        } else {
            let message = `<p>${conanCheck} successfully found on your machine.`;
            webviewView.webview.html = getSimpleHtmlPage(message);
        }
        return checkOk;
    }
}