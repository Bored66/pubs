import * as vscode from 'vscode';
import { checkForConan, getSimpleHtmlPage, getWebviewOptions } from './utils';

export class checkInfoView implements vscode.WebviewViewProvider {
    public static readonly viewType = "mo.sysInfo";
    public static message: string = '';
    private _view?: vscode.WebviewView;
    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) { }

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
    }
}