import { DefinitionProvider, TextDocument, Position, Definition, Location, CancellationToken } from 'vscode';
import { JavaParser } from '../parser/javaParser';

export class JavaDefinitionProvider implements DefinitionProvider {
    public async provideDefinition(
        document: TextDocument,
        position: Position,
        token: CancellationToken
    ): Promise<Definition | undefined> {
        const parser = new JavaParser(document);
        const offset = document.offsetAt(position);
        const symbol = parser.findSymbolAtPosition(offset);

        if (symbol) {
            return new Location(
                document.uri,
                document.positionAt(symbol.range.start)
            );
        }

        return undefined;
    }
}