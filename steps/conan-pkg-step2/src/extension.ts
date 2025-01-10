// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DepNode, ProjectDeps } from './projectDeps';
import { checkFor, checkForConan, fileExists, readJsonFile } from './utils';
import { CheckInfoView } from './check';
import { ProjectSettingsView } from './config';

export async function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "conan-pkg-presets" is now active!');

	let disposableCmd = vscode.commands.registerCommand('conan-pkg.version', () => {
		let conanCheck = checkForConan();
		if (conanCheck === undefined || conanCheck.startsWith('error:')) {
			vscode.window.showWarningMessage("Conan not found, you must install it");
		} else {
			vscode.window.showInformationMessage(`${conanCheck} successfully found on your machine.`);
		}
	});

	let msg = vscode.window.setStatusBarMessage("$(sync~spin) Go find conan!");

	let cmdId = 'conan-pkg.version';
	let barItem = createBarItem(context, cmdId, 'darkblue', "$(loading~spin) Version Info", "Package Version Info");
	barItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
	barItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
	barItem.show();
	// setTimeout(() => { if ()  }, 500);
	setTimeout(() => { msg.dispose(); barItem.backgroundColor = ''; barItem.text = "$(chip) Version Info"; }, 12500);
	// vscode.CustomExecution()

	const sysInfoViewProvider = new CheckInfoView(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(CheckInfoView.viewType, sysInfoViewProvider));

	// SysInfoView.badgeTreeView = treeView;
	const settingsView = new ProjectSettingsView(context.extensionUri);
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ProjectSettingsView.viewType, settingsView));
	context.subscriptions.push(disposableCmd);

	// vscode.window.setStatusBarMessage("message");

	let treeView: vscode.TreeView<any> | undefined = undefined;
	const projDeps = new ProjectDeps;
	const conanFilePath = //"/home/eduard/repos/dsf/tsnative-new/compiler";
	//"/home/borovitski/repos/dsf/conan-build/tsnative/compiler/"
	vscode.Uri.joinPath(context.extensionUri, 'data');
	const conanInfoJsonPath = vscode.Uri.joinPath(context.extensionUri, 'data', `prj-requires-db.json`);

	if (await fileExists(conanInfoJsonPath)) {
		console.log('Request conan info file: ' + conanInfoJsonPath);
	} else {
		const conanInfoToFile = `conan info ${conanFilePath.fsPath} -db -j ${conanInfoJsonPath.fsPath} > /dev/null`;
		console.log('Request conan info in ' + conanFilePath);
		const result = checkFor(conanInfoToFile);
		if (result?.startsWith('error: ')) {
			console.error(result);
		}
	}
	let conanInfoCmd = vscode.commands.registerCommand('conan-pkg.conanInfo', async () => {
		console.log("Starting conan info command...");
		if (treeView) {
			console.log(treeView.selection);
			let selection: DepNode[] = treeView.selection as DepNode[];
			if (selection[0].name) {
				const cmd = `conan info ${selection[0].name}@ -db`;
				const result = checkFor(cmd);
				if (result?.startsWith('error: ')) {
					console.error(result);
				}
			}
		}
		console.log("Conan info command done.");
	});
	context.subscriptions.push(conanInfoCmd);

	const deps = await readJsonFile(conanInfoJsonPath);
	projDeps.fillDeps(deps);
	treeView = vscode.window.createTreeView(projDeps.viewType, {
		treeDataProvider: projDeps,
		showCollapseAll: true, canSelectMany: false
	});
	context.subscriptions.push(treeView);
}

// this method is called when your extension is deactivated
export function deactivate() { }

function createBarItem(context: vscode.ExtensionContext,
	cmdId: string, color: string | vscode.ThemeColor,
	text: string, tooltip: string): vscode.StatusBarItem {
	const barItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 30);
	barItem.command = cmdId;
	context.subscriptions.push(barItem);
	barItem.text = text;
	barItem.tooltip = tooltip;
	barItem.color = color;
	return barItem;
}
