import { DefinitionProvider, TextDocument, Position, Definition, Location, CancellationToken } from 'vscode';
import { WorkspaceManager } from '../workspace/workspaceManager';
import { SymbolFinder } from './definition/symbolFinder';
import { ImportClassFinder } from './definition/importClassFinder';
import * as vscode from 'vscode';

export class JavaDefinitionProvider implements DefinitionProvider {
    private symbolFinder: SymbolFinder;
    private importClassFinder: ImportClassFinder;

    constructor(private workspaceManager: WorkspaceManager) {
        this.symbolFinder = new SymbolFinder();
        this.importClassFinder = new ImportClassFinder(workspaceManager);
    }

    public async provideDefinition(document: TextDocument, position: Position, token: CancellationToken): Promise<Definition | undefined> {
        const fileInfo = this.workspaceManager.getByDocument(document);
        if (!fileInfo) {
            return undefined;
        }

        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }

        const word = document.getText(wordRange);
        if (['String', 'Integer', 'Boolean', 'Double', 'Float', 'Long', 'Short', 'Byte', 'Character', 'Void', 'Null'].includes(word)) {
            return undefined;
        }

        // Check if the previous character is a dot
        // Only proceed if we're not at the start of the line
        // if (wordRange.start.character > 1) {
        //     const prevCharPosition = new Position(position.line, wordRange.start.character - 1);
        //     const prevCharRange = new vscode.Range(prevCharPosition, prevCharPosition.translate(0, 1));
        //     const prevChar = document.getText(prevCharRange);

        //     if (prevChar === '.') {
        //         return undefined;
        //     }
        // }

        const localSymbol = this.symbolFinder.findSymbolAtPosition(fileInfo, position, word);
        if (localSymbol) {
            return new Location(
                document.uri,
                localSymbol.identifierLocation || localSymbol.range.start
            );
        }

        return this.importClassFinder.findImportedClass(fileInfo, word);
    }
}