import ChildProcess from 'child_process';
import os from 'os';
import * as vscode from 'vscode';

export class ClipboardImage {
	img: string = "";
	width: number = 0;
	height: number = 0;
}
// read clipboard image data as Uint8Array

export async function readClipboardImage(): Promise<ClipboardImage> {
	let clipboardImage: ClipboardImage = new ClipboardImage();
	try {
		// exec command to get clipboard image data with powershell		
		await getClipBoardInfo(clipboardImage);
	} catch (error) {
		console.error("[Error] failed to read clipboard image data!");
	}

	return Promise.resolve(clipboardImage);
}

async function getClipBoardInfo(clipboardImage: ClipboardImage) {
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
		let clipboardImageJson = ChildProcess.execSync(pwshcmd, { shell: "pwsh.exe", encoding: "utf8" });
		// convert json string to ClipboardImage object
		clipboardImage = JSON.parse(clipboardImageJson);
	} else {
		vscode.window.showInformationMessage(`This extension is not support this platform: ${os.platform()}!`);
	}
	return Promise.resolve(clipboardImage);
}
