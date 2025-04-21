import { ExtensionContext, languages, workspace } from 'vscode';
import { JavaCompletionProvider } from './providers/completionProvider';
import { JavaDefinitionProvider } from './providers/definitionProvider';
import { JavaOutlineProvider } from './providers/outlineProvider';
import { WorkspaceManager } from './workspace/workspaceManager';

export function activate(context: ExtensionContext) {
	console.log('Java Simple Support is now active!');

	const workspaceManager = new WorkspaceManager();

	// 初始化工作空间解析
	workspaceManager.initializeWorkspace();

	const documentChange = workspace.onDidChangeTextDocument((event) => {
		workspaceManager.onDocumentChange(event);
	});

	const selector = { language: 'java' };
	context.subscriptions.push(
		languages.registerDocumentSymbolProvider(selector, new JavaOutlineProvider(workspaceManager)),
		languages.registerDefinitionProvider(selector, new JavaDefinitionProvider(workspaceManager)),
		// languages.registerCompletionItemProvider(selector, new JavaCompletionProvider(workspaceManager)),
		documentChange
	);
}

export function deactivate() { }
