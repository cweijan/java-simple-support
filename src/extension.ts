import { ExtensionContext, languages, workspace, commands, window, Range, Selection } from 'vscode';
import { JavaDefinitionProvider } from './providers/definitionProvider';
import { JavaOutlineProvider } from './providers/outlineProvider';
import { JavaFoldingProvider } from './providers/foldingProvider';
import { JavaTypeDefinitionProvider } from './providers/typeDefinitionProvider';
import { JavaImplementationProvider } from './providers/implementationProvider';
import { WorkspaceManager } from './workspace/workspaceManager';
import { MapperManager } from './workspace/mapperManager';
import { JavaMyBatisCodeLensProvider } from './providers/codelensProvider';
import { JavaDiagnosticProvider } from './providers/diagnosticProvider';

export function activate(context: ExtensionContext) {
	console.log('Java Simple Support is now active!');

	const mapperManager = new MapperManager();
	const workspaceManager = new WorkspaceManager();
	const diagnosticProvider = new JavaDiagnosticProvider(workspaceManager);

	mapperManager.initialize();
	workspaceManager.initializeWorkspace();

	registerGotoMapperCommand(context);

	const documentChange = workspace.onDidChangeTextDocument((event) => {
		workspaceManager.onDocumentChange(event);
		mapperManager.onDocumentChange(event.document);
		diagnosticProvider.updateDiagnostics(event.document);
	});

	const selector = { language: 'java' };
	context.subscriptions.push(
		languages.registerDocumentSymbolProvider(selector, new JavaOutlineProvider(workspaceManager)),
		languages.registerFoldingRangeProvider(selector, new JavaFoldingProvider(workspaceManager)),
		languages.registerTypeDefinitionProvider(selector, new JavaTypeDefinitionProvider(workspaceManager)),
		languages.registerDefinitionProvider(selector, new JavaDefinitionProvider(workspaceManager, mapperManager)),
		languages.registerImplementationProvider(selector, new JavaImplementationProvider(workspaceManager, mapperManager)),
		languages.registerCodeLensProvider(selector, new JavaMyBatisCodeLensProvider(workspaceManager, mapperManager)),
		// languages.registerCompletionItemProvider(selector, new JavaCompletionProvider(workspaceManager)),
		documentChange,
		diagnosticProvider
	);
}

export function deactivate() { }


function registerGotoMapperCommand(context: ExtensionContext) {
	context.subscriptions.push(
		commands.registerCommand('java-simple-support.gotoMapper', async (uri: string, range: Range, selection?: Range) => {
			const editor = window.activeTextEditor;
			if (editor) {
				editor.selection = new Selection(range.start, range.start);
				editor.revealRange(range);
			}
			await commands.executeCommand('vscode.open', uri, { selection });
		})
	);
}