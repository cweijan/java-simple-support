import { parse, createVisitor } from 'java-ast';
import { TextDocument } from 'vscode';

export type JavaSymbolKind = 'class' | 'method' | 'field' | 'parameter';

export interface JavaSymbol {
    name: string;
    kind: JavaSymbolKind;
    range: {
        start: number;
        end: number;
    };
    children?: JavaSymbol[];
    identifierLocation?: number;
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
                const id = ctx.identifier();
                const name = id.text;
                const methodSymbol: JavaSymbol = {
                    name,
                    kind: 'method',
                    range: {
                        start: ctx.start.startIndex,
                        end: ctx.stop?.stopIndex || ctx.start.startIndex
                    },
                    identifierLocation: id.start.startIndex,
                    children: this.parseMethodParameters(ctx)
                };
                symbols.push(methodSymbol);
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

    private parseMethodParameters(ctx: any): JavaSymbol[] {
        const parameters: JavaSymbol[] = [];
        const formalParameters = ctx.formalParameters();
        if (formalParameters) {
            const parameterList = formalParameters.formalParameterList();
            if (parameterList) {
                for (const param of parameterList.formalParameter()) {
                    const id = param.variableDeclaratorId();
                    const name = id.identifier().text;
                    parameters.push({
                        name,
                        kind: 'parameter',
                        range: {
                            start: param.start.startIndex,
                            end: param.stop?.stopIndex || param.start.startIndex
                        },
                        identifierLocation: id.start.startIndex
                    });
                }
            }
        }
        return parameters;
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

    private findSymbolRecursive(symbols: JavaSymbol[], position: number, word: string): JavaSymbol | undefined {
        // 深度遍历
        for (const symbol of symbols) {
            if (position >= symbol.range.start && position <= symbol.range.end) {
                if (symbol.children) {
                    const child = this.findSymbolRecursive(symbol.children, position, word);
                    if (child) { return child; }
                }
                if (symbol.name === word) {
                    return symbol;
                }
            } else if (symbol.name === word) {
                return symbol;
            }
        }
        // 如果深度遍历找不到, 则进行广度遍历
        for (const symbol of symbols) {
            if (symbol.name === word) {
                return symbol;
            }
        }
        return undefined;
    }

} 