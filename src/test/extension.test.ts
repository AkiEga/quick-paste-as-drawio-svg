import * as assert from 'assert';
import * as path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../extension';

suite('Extension Test Suite', async () => {
  // Open workspace for this test
  const workspaceFolder = path.resolve(`${__dirname}/../../src/test/sandbox_workspace`);

  await test('Sample test', async () => {
      // open ${workspaceFolder}/Readme.md
      let doc = await vscode.workspace.openTextDocument(vscode.Uri.file(`${workspaceFolder}/Readme.md`), );
      await vscode.window.showTextDocument(doc);
      let editor = vscode.window.activeTextEditor;
      let resolvedImgDir = await myExtension.resolveImgDir("./img", editor);
      assert.strictEqual(path.resolve(resolvedImgDir), path.resolve(`${workspaceFolder}/img`));
    }
  );

  // suiteTeardown(() => {
  //   vscode.window.showInformationMessage('All tests done!');
  // });
  
});
