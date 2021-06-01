import * as vscode from 'vscode';
import { HelmTemplateHoverProvider } from "./providers/helmTemplate.hoverProvider";
import { HelmTemplateCompletionItemProvider } from "./providers/helmTemplate.completionItemProvider";

// helm mode
export const HELM_MODE: vscode.DocumentFilter = { language: "helm-template", scheme: "file" };

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "helm-helper" is now active!');

	let disposable = vscode.commands.registerCommand('helm-helper.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from helm-helper!');
	});
	context.subscriptions.push(disposable);

	// Hover Provider
	vscode.languages.registerHoverProvider(HELM_MODE, new HelmTemplateHoverProvider());
	// CompletionItem Function Provider
	//vscode.languages.registerCompletionItemProvider(HELM_MODE, new HelmTemplateCompletionItemProvider(), ".");
	// CompletionItem Values Provider
	//vscode.languages.registerCompletionItemProvider()
}

// this method is called when your extension is deactivated
export function deactivate() { }
