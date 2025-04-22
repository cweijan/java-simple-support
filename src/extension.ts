import { ExtensionContext, languages, workspace } from 'vscode';
import { JavaDefinitionProvider } from './providers/definitionProvider';
import { JavaOutlineProvider } from './providers/outlineProvider';
import { JavaFoldingProvider } from './providers/foldingProvider';
import { JavaTypeDefinitionProvider } from './providers/typeDefinitionProvider';
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
		languages.registerTypeDefinitionProvider(selector, new JavaTypeDefinitionProvider(workspaceManager)),
		languages.registerFoldingRangeProvider(selector, new JavaFoldingProvider(workspaceManager)),
		// languages.registerCompletionItemProvider(selector, new JavaCompletionProvider(workspaceManager)),
		documentChange
	);
}

export function deactivate() { }
