import { ExtensionContext, languages, TextDocumentChangeEvent, workspace } from 'vscode';
import { JavaCompletionProvider } from './providers/completionProvider';
import { JavaDefinitionProvider } from './providers/definitionProvider';
import { JavaOutlineProvider } from './providers/outlineProvider';

export function activate(context: ExtensionContext) {
	console.log('Java Simple Support is now active!');

	const documentChange = workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
		// if (event.document.languageId === 'java') { }
	});

	const selector = { language: 'java' };
	context.subscriptions.push(
		languages.registerDocumentSymbolProvider(selector, new JavaOutlineProvider()),
		languages.registerDefinitionProvider(selector, new JavaDefinitionProvider()),
		languages.registerCompletionItemProvider(selector, new JavaCompletionProvider()),
		documentChange
	);
}

export function deactivate() { }
