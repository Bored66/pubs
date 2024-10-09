// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child from 'child_process';
import { DepNode, ProjectDeps } from './projectDeps';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "conan-pkg-treeview" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposableCmd = vscode.commands.registerCommand('conan-pkg.hellworld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from conan-pkg.hellworld!');
	});
	let disposableCmd2 = vscode.commands.registerCommand('conan-pkg.version', () => {
		let conanCheck = checkForConan();
		if (conanCheck === undefined || conanCheck.startsWith('error:')) {
			vscode.window.showWarningMessage("Conan not found, you must install it");
		} else {
			vscode.window.showInformationMessage(`${conanCheck} successfully found on your machine.`);
		}
	});

	context.subscriptions.push(disposableCmd);
	context.subscriptions.push(disposableCmd2);

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
	console.log("Before reading json");

	const deps = await readJsonFile(conanInfoJsonPath);
	console.log("After reading json");
	projDeps.fillDeps(deps);
	treeView = vscode.window.createTreeView(projDeps.viewType, {
		treeDataProvider: projDeps,
		showCollapseAll: true, canSelectMany: false
	});
	context.subscriptions.push(treeView);
}

// this method is called when your extension is deactivated
export function deactivate() { }

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
