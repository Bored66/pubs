import * as vscode from 'vscode';
import { checkForConan, getSimpleHtmlPage, getWebviewOptions } from './utils';

export class CheckInfoView implements vscode.WebviewViewProvider {
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
    }
        // console.log("Checking from info on resolveWebviewView...");
        // let ok = await this.runCheck();

        public async runCheck(): Promise<boolean> {
        if (this._view === undefined)
        {
            return false;
        }
        let conanCheck = checkForConan();
        if (conanCheck === undefined || conanCheck.startsWith('error:')) {
            const message = 'Conan not found on your machine"';
            this._view.webview.html = getSimpleHtmlPage("<p color=red>" + message + "<p color=red>Cannot proceed without conan");
            return false;
        } else {
            const message = `<p>${conanCheck} successfully found on your machine.`;
            this._view.webview.html = getSimpleHtmlPage(message);
        }
        return true;
    }
}