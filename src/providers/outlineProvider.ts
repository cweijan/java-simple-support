import { DocumentSymbolProvider, TextDocument, SymbolInformation, SymbolKind, CancellationToken, Location, Range } from 'vscode';
import { JavaAstParser, JavaSymbol } from '../parser/javaAstParser';

export class JavaOutlineProvider implements DocumentSymbolProvider {
    public async provideDocumentSymbols(
        document: TextDocument,
        token: CancellationToken
    ): Promise<SymbolInformation[]> {
        const parser = new JavaAstParser(document);
        const { symbols } = parser.parse();
        const result: SymbolInformation[] = [];

        const processSymbol = (symbol: JavaSymbol, containerName?: string) => {
            const kind = this.getSymbolKind(symbol.kind);
            const symbolInfo = new SymbolInformation(
                symbol.name,
                kind,
                containerName || null,
                new Location(document.uri, new Range(
                    document.positionAt(symbol.range.start),
                    document.positionAt(symbol.range.end)
                ))
            );
            result.push(symbolInfo);

            if (symbol.children) {
                for (const child of symbol.children) {
                    processSymbol(child, symbol.name);
                }
            }
        };

        for (const symbol of symbols) {
            processSymbol(symbol);
        }

        return result;
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