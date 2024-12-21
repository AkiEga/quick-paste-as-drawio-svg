import { defineConfig } from '@vscode/test-cli';

export default defineConfig({
	label: 'unitTests',
	files: 'out/test/extension.test.js',
	extensionDevelopmentPath: "./",
	version: "stable",
	srcDir: "./src"	,
  	workspaceFolder: 'src/test/sandbox_workspace',
	  mocha: {
		ui: 'tdd',
		timeout: 20000
	  }
});
