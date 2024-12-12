import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';
import * as vscodeTest from 'vscode-test';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');
	test('Sample test', async () => {
		// open folder
		await vscodeTest.runTests({
			extensionDevelopmentPath: __dirname,
			extensionTestsPath: __dirname,
			launchArgs: [__dirname],
		}).then(()=>{
			myExtension.resolveImgDir("${workspaceFolder}/img", undefined).then((ret)=>{
				let expected = __dirname + "/img";
				assert.strictEqual(ret, expected);
			});
		});
});

