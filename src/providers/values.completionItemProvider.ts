import * as vscode from 'vscode';

// values补全 Provider
export class ValuesCompletionItemProvider implements vscode.CompletionItemProvider {
  provideCompletionItems(doc: vscode.TextDocument, pos: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    throw new Error('Method not implemented.');
  }
}