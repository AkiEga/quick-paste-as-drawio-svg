// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import path from 'path';
import fs from 'fs';
import os from 'os';
import ChildProcess from 'child_process';

class ClipboardImage {
	img: string = "";
	width: number = 0;
	height: number = 0;
}

// read clipboard image data as Uint8Array
function readClipboardImage(): ClipboardImage {
	let clipboardImage: ClipboardImage = new ClipboardImage();
	try {
		// exec command to get clipboard image data with powershell		
		if (os.platform() === "win32") {
			// TODO: implement to get clipboard image data with powershell
			// let pwshcmd = `
			// Add-Type -AssemblyName System.Windows.Forms;
			// $obj = [System.Windows.Forms.Clipboard]::GetDataObject();
			// if ($true -eq $obj.ContainsImage()) {
			// 	$image = [System.Windows.Forms.Clipboard]::GetImage()
			// 	$ms = New-Object -TypeName System.IO.MemoryStream;
			// 	$image.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png);
			// 	$encoded = [System.Convert]::ToBase64String($ms.GetBuffer());
			// 	$json = @{"img"=$encoded;"width"=$image.Width; "height"=$image.Height}
			// } else {
			// 	$json = @{"img"="";"width"=0; "height"=0}
			// }
			// $json | ConvertTo-Json`;
			let pwshcmd = `
			Add-Type -AssemblyName System.Windows.Forms;
			$obj = [System.Windows.Forms.Clipboard]::GetDataObject();
			if ($true -eq $obj.ContainsImage()) {
				$image = [System.Windows.Forms.Clipboard]::GetImage()
				$json = @{"img"="It will be insert base64 str";"width"=$image.Width; "height"=$image.Height}
			} else {
				$json = @{"img"="";"width"=0; "height"=0}
			}
			$json | ConvertTo-Json`;
			// exec command to get clipboard image data with powershell
			let clipboardImageJson = ChildProcess.execSync(pwshcmd, {shell: "pwsh.exe", encoding: "utf8"});
			// convert json string to ClipboardImage object
			clipboardImage = JSON.parse(clipboardImageJson);
		} else {
			vscode.window.showInformationMessage(`This extension is not support this platform: ${os.platform()}!`);
		}
	} catch (error) {
		console.error("[Error] failed to read clipboard image data!");
	}
	return clipboardImage;
}

function createDrawioSvgFile(tarUri: vscode.Uri, ci: ClipboardImage) {		
	let newFileContentStr = "";
	// TODO: implement to write to drawio.svg file
	// // read base drawio.svg file content
	// // let newFileContentStr = templateDrawioSvg + `
	// // let newFileContentStr = `<svg xmlns="http://www.w3.org/2000/svg"
	// // 	xmlns:xlink="http://www.w3.org/1999/xlink">
	// // 	<image x="0" y="0" width="${ci.width}" height="${ci.height}" xlink:href="data:image/png;base64,${ci.img}" />
	// // </svg>`;
	
	// convert string to Uint8Array
	let newFileContent = new TextEncoder().encode(newFileContentStr);
	vscode.workspace.fs.writeFile(tarUri, newFileContent);	
}

async function quickPasteAsDrawioSvg(editor: vscode.TextEditor, ws: vscode.WorkspaceFolder) {
	// The code you place here will be executed every time your command is executed
	// Display a message box to the user
	let pasteMode = "image";
	let newFileUri = vscode.Uri.file("");
	let insertText = "";
	try {
		// get image data from clipboard
		let ci = readClipboardImage();
		if (ci.img === "") {
			pasteMode = "text";
			// get text data from clipboard
			insertText = await vscode.env.clipboard.readText();
		} else {
			// Touch(=create=write) an drawio.svg file
			// Check if new file is already exist
			let conf = vscode.workspace.getConfiguration("quick-paste-as-drawio-svg");
			let imgDir:string = conf.get("img-dir")??"";
			let prefix:string = conf.get("img-file-prefix") ?? "";
			newFileUri = GenNewFileUri(ws, imgDir, prefix);		
			createDrawioSvgFile(newFileUri, ci);
			
			vscode.window.showInformationMessage(`write new file: ${newFileUri} from quick-paste-as-drawio-svg!`);
		}
	} catch (error) {
		console.error("[Error] failed to write a drawio.svg file from quick-paste-as-drawio-svg extension!");
	}

	// append a drawio.svg markdown link to active editor
	editor.edit((e)=>{
		if (ws && editor) {
			if (pasteMode === "image") {
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
				insertText = `![](${relativePath})`;
			}
			// insert text to active editor
			let currentPos = editor.selection.end;
			e.insert(currentPos, insertText);
		}
	});
}

function GenNewFileUri(ws: vscode.WorkspaceFolder, imgDir: string = "", prefix: string = ""): vscode.Uri {
	let newFileUri: vscode.Uri;
	for (let id = 0; ; id++) {
		let newFileName = `${prefix}_${id}.drawio.svg`;
		newFileUri = vscode.Uri.joinPath(ws.uri, imgDir, newFileName);
		if (!fs.existsSync(newFileUri.fsPath)) {
			// passed
			break;
		}
	}
	return newFileUri;
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
	let disposable = vscode.commands.registerCommand('quick-paste-as-drawio-svg.create-new-drawio-svg', async () => {
		let editor = vscode.window.activeTextEditor;
		if (!editor) {
			return;
		}
		let ws = vscode.workspace.getWorkspaceFolder(editor?.document.uri);
		if (!ws) {
			return;
		}
		quickPasteAsDrawioSvg(editor, ws);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
