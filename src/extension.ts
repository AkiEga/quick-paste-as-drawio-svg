// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ChildProcess from 'child_process';

// read clipboard image data as Uint8Array
function readClipboardImage():Uint8Array {
	let imgData:Uint8Array = new Uint8Array(0);
	try {
		// exec command to get clipboard image data with powershell		
		let base64Str = "";
		if (os.platform() === "win32") {
			let pwshcmd = `Add-Type -AssemblyName System.Windows.Forms;
			$image = [System.Windows.Forms.Clipboard]::GetImage()
			$ms = New-Object -TypeName System.IO.MemoryStream;
			$image.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png);
			$encoded = [System.Convert]::ToBase64String($ms.GetBuffer());
			Write-Host $encoded`;
			// exec command to get clipboard image data with powershell
			base64Str = ChildProcess.execSync(pwshcmd, {shell: "pwsh.exe", encoding: "utf8"});
		} else {
			vscode.window.showInformationMessage(`This extension is not support this platform: ${os.platform()}!`);
		}

		// convert base64 string to Uint8Array
		imgData = new Uint8Array(Buffer.from(base64Str, "base64"));
	} catch (error) {
		console.error("[Error] failed to read clipboard image data!");
	}
	return imgData;	
}

async function touchSvgFile() {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
	}
	let ws = vscode.workspace.getWorkspaceFolder(editor?.document.uri);
	if (!ws) {
		return;
	}

	// Touch(=create=write) an drawio.svg file
	let conf = vscode.workspace.getConfiguration("quick-paste-as-drawio-svg");
	// get imgDir default value from package.json
	let imgDir:string = conf.get("img-dir")??"";
	let newFileUri = ws.uri;
	let newFileContent = new Uint8Array();
	// get image data from clipboard

	try {
		// Check if new file is already exist
		for (let id = 0;; id++) {
			let prefix = conf.get("img-file-prefix")??"";
			let newFileName = `${prefix}_${id}.drawio.svg`;
			newFileUri = vscode.Uri.joinPath(ws.uri, imgDir, newFileName);
			// let ret = await vscode.workspace.findFiles(newFileUri.fsPath);
			if (!fs.existsSync(newFileUri.fsPath)) {
				// passed
				break;
			}
		}
		vscode.workspace.fs.writeFile(newFileUri, newFileContent);	
	} catch (error) {
		console.error("[Error] failed to write a drawio.svg file from quick-paste-as-drawio-svg extension!");
	}
	vscode.window.showInformationMessage(`write new file: ${newFileUri} from quick-paste-as-drawio-svg!`);

	// append a drawio.svg markdown link to active editor
	editor.edit((e)=>{
		if (ws && editor) {
			// make relative path of a *.drawio.svg file 
			let parentDir = path.dirname(editor.document.uri.fsPath);
			let newFilePath = newFileUri.fsPath;

			// Convert to relative path
			let relativePath = "";
			if (os.platform() === "win32"){
				relativePath = path.win32.relative(parentDir, newFilePath).replace(/\\/g, "/");
			} else {
				relativePath = path.relative(parentDir, newFilePath);
			}
			
			let currentPos = editor.selection.end;
			e.insert(currentPos, `![](${relativePath})`);
		}
	});
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "quick-paste-as-drawio-svg" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('quick-paste-as-drawio-svg.create-new-drawio-svg', touchSvgFile);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
