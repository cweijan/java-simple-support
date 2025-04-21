import { TextDocument } from 'vscode';

export interface JavaSymbol {
    name: string;
    kind: string;
    range: {
        start: number;
        end: number;
    };
    children?: JavaSymbol[];
}

export class JavaParser {
    private document: TextDocument;

    constructor(document: TextDocument) {
        this.document = document;
    }

    public parse(): JavaSymbol[] {
        const symbols: JavaSymbol[] = [];
        const text = this.document.getText();

        // 简单的正则匹配来解析类、方法和字段
        const classRegex = /(?:public|private|protected)?\s*class\s+(\w+)/g;
        const methodRegex = /(?:public|private|protected)?\s*(?:\w+\s+)*(\w+)\s*\([^)]*\)/g;
        const fieldRegex = /(?:public|private|protected)?\s*(?:\w+\s+)*(\w+)\s*;/g;

        let match;
        while ((match = classRegex.exec(text)) !== null) {
            symbols.push({
                name: match[1],
                kind: 'class',
                range: {
                    start: match.index,
                    end: match.index + match[0].length
                }
            });
        }

        return symbols;
    }

    public findSymbolAtPosition(position: number): JavaSymbol | undefined {
        const symbols = this.parse();
        return this.findSymbolRecursive(symbols, position);
    }

    private findSymbolRecursive(symbols: JavaSymbol[], position: number): JavaSymbol | undefined {
        for (const symbol of symbols) {
            if (position >= symbol.range.start && position <= symbol.range.end) {
                if (symbol.children) {
                    const child = this.findSymbolRecursive(symbol.children, position);
                    if (child) { return child; }
                }
                return symbol;
            }
        }
        return undefined;
    }
} 