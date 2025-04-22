import { DefinitionProvider, TextDocument, Position, Definition, Location, CancellationToken, Range } from 'vscode';
import { WorkspaceManager } from '../workspace/workspaceManager';
import { SymbolFinder } from './definition/symbolFinder';
import { ImportClassFinder } from './definition/importClassFinder';
import { MemberFinder } from './definition/memberFinder';

export class JavaDefinitionProvider implements DefinitionProvider {
    private symbolFinder: SymbolFinder;
    private importClassFinder: ImportClassFinder;
    private memberFinder: MemberFinder;

    constructor(private workspaceManager: WorkspaceManager) {
        this.symbolFinder = new SymbolFinder();
        this.importClassFinder = new ImportClassFinder(workspaceManager);
        this.memberFinder = new MemberFinder(workspaceManager);
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
        if (wordRange.start.character > 1) {
            const prevCharPosition = new Position(position.line, wordRange.start.character - 1);
            const prevCharRange = new Range(prevCharPosition, prevCharPosition.translate(0, 1));
            const prevChar = document.getText(prevCharRange);

            if (prevChar === '.') {
                const typeNameRange = document.getWordRangeAtPosition(new Position(position.line, wordRange.start.character - 2));
                if (typeNameRange) {
                    const typeName = document.getText(typeNameRange);
                    const typeSymbol = this.symbolFinder.findSymbolAtPosition(fileInfo, typeNameRange.start, typeName);
                    const target = typeSymbol?.typeName || typeName;
                    return this.memberFinder.findMember(fileInfo, word, target);
                }
                return undefined;
            }
        }

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