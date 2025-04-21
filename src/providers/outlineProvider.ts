import { DocumentSymbolProvider, TextDocument, SymbolInformation, SymbolKind, CancellationToken, Location } from 'vscode';
import { JavaParser, JavaSymbol } from '../parser/javaParser';

export class JavaOutlineProvider implements DocumentSymbolProvider {
    public async provideDocumentSymbols(
        document: TextDocument,
        token: CancellationToken
    ): Promise<SymbolInformation[]> {
        const parser = new JavaParser(document);
        const symbols = parser.parse();

        return symbols.map(symbol => {
            const kind = this.getSymbolKind(symbol.kind);
            return new SymbolInformation(
                symbol.name,
                kind,
                null,
                new Location(document.uri, document.positionAt(symbol.range.start))
            );
        });
    }

    private getSymbolKind(kind: string): SymbolKind {
        switch (kind) {
            case 'class':
                return SymbolKind.Class;
            case 'method':
                return SymbolKind.Method;
            case 'field':
                return SymbolKind.Field;
            default:
                return SymbolKind.Variable;
        }
    }
} 