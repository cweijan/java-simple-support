import { parse, createVisitor } from 'java-ast';
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

export class JavaAstParser {
    private document: TextDocument;

    constructor(document: TextDocument) {
        this.document = document;
    }

    public parse(): JavaSymbol[] {
        const text = this.document.getText();
        const ast = parse(text);

        const symbols: JavaSymbol[] = [];
        const visitor = createVisitor({
            visitClassDeclaration: (ctx) => {
                const name = ctx.identifier().text;
                const classSymbol: JavaSymbol = {
                    name,
                    kind: 'class',
                    range: {
                        start: ctx.start.startIndex,
                        end: ctx.stop?.stopIndex || ctx.start.startIndex
                    },
                    children: []
                };
                symbols.push(classSymbol);

                // 访问类体，收集方法和字段
                const classBody = ctx.classBody();
                if (classBody) {
                    // 将类体中的方法和字段添加到类的children中
                    const classBodySymbols = this.parseClassBody(classBody);
                    classSymbol.children = classBodySymbols;
                }
                return 1;
            }
        });

        visitor.visit(ast);
        return symbols;
    }

    private parseClassBody(classBody: any): JavaSymbol[] {
        const symbols: JavaSymbol[] = [];
        const visitor = createVisitor({
            visitMethodDeclaration: (ctx) => {
                const name = ctx.identifier().text;
                symbols.push({
                    name,
                    kind: 'method',
                    range: {
                        start: ctx.start.startIndex,
                        end: ctx.stop?.stopIndex || ctx.start.startIndex
                    }
                });
                return 1;
            },
            visitFieldDeclaration: (ctx) => {
                const variableDeclarators = ctx.variableDeclarators();
                for (const declarator of variableDeclarators.variableDeclarator()) {
                    const name = declarator.variableDeclaratorId().identifier().text;
                    symbols.push({
                        name,
                        kind: 'field',
                        range: {
                            start: declarator.start.startIndex,
                            end: declarator.stop?.stopIndex || declarator.start.startIndex
                        }
                    });
                }
                return 1;
            }
        });

        visitor.visit(classBody);
        return symbols;
    }

    public countMethods(source: string): number {
        const ast = parse(source);
        let count = 0;

        const visitor = createVisitor({
            visitMethodDeclaration: (ctx) => {
                count++;
                return 1;
            }
        });

        visitor.visit(ast);
        return count;
    }

    public findSymbolAtPosition(position: number, word: string): JavaSymbol | undefined {
        const symbols = this.parse();
        return this.findSymbolRecursive(symbols, position, word);
    }

    private findSymbolRecursive(symbols: JavaSymbol[], position: number, word: string, level = 0): JavaSymbol | undefined {
        // 先查找当前范围的最小符号
        for (const symbol of symbols) {
            if (position >= symbol.range.start && position <= symbol.range.end) {
                if (symbol.children) {
                    const child = this.findSymbolRecursive(symbol.children, position, word, ++level);
                    if (child) { return child; }
                }
                if (symbol.name === word) {
                    return symbol;
                }
            }
        }
        if (level < 2) {
            // 如果当前范围找不到, 则查找class或class下面的field/method
            for (const symbol of symbols) {
                if (symbol.name === word) {
                    return symbol;
                }
            }
        }
        return undefined;
    }

} 