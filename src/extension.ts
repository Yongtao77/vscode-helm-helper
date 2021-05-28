import * as vscode from 'vscode';
import { HelmTemplateHoverProvider } from "./providers/helmTemplate.hoverProvider";
import { HelmTemplateCompletionItemProvider } from "./providers/helmTemplate.completionItemProvider";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "helm-helper" is now active!');

	let disposable = vscode.commands.registerCommand('helm-helper.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from helm-helper!');
	});
	context.subscriptions.push(disposable);

	// Hover Provider
	vscode.languages.registerHoverProvider("helm-template", new HelmTemplateHoverProvider());
	// CompletionItem Provider
	vscode.languages.registerCompletionItemProvider("helm-template", new HelmTemplateCompletionItemProvider());
}

// this method is called when your extension is deactivated
export function deactivate() { }
