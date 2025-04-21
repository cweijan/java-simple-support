import { parse, createVisitor } from 'java-ast';
import { TextDocument, Range, Location, Uri, Position } from 'vscode';

export type JavaSymbolKind = 'class' | 'method' | 'field' | 'parameter';

export interface ImportInfo {
    identifier: string;
    qualifiedName: string;
}

export interface JavaFileInfo {
    modulePath: string;
    packageName: string;
    importInfos: ImportInfo[];
    classSymbol: JavaSymbol;
    qualifiedName: string;
    symbols: JavaSymbol[];
    filePath: string;
}

export interface JavaSymbol {
    name: string;
    kind: JavaSymbolKind;
    range: Range;
    children?: JavaSymbol[];
    identifierLocation?: Position;
}

export class JavaAstParser {
    private document: TextDocument;

    constructor(document: TextDocument) {
        this.document = document;
    }

    private calculateModulePath(filePath: string, packageName: string): string {
        filePath = filePath.replaceAll('\\', '/').replace('src/main/java/', '');
        if (!packageName) {
            return filePath;
        }
        const packagePath = packageName.replace(/\./g, '/');
        const fileDir = filePath.substring(0, filePath.lastIndexOf('/'));
        if (fileDir.endsWith(packagePath)) {
            return fileDir.substring(0, fileDir.length - packagePath.length);
        }
        return fileDir;
    }

    public parse(): JavaFileInfo {
        const text = this.document.getText();
        const ast = parse(text);

        let classSymbol: JavaSymbol;
        let packageName = '';
        const importInfos: ImportInfo[] = [];
        const symbols: JavaSymbol[] = [];

        const visitor = createVisitor({
            visitPackageDeclaration: (ctx) => {
                packageName = ctx.qualifiedName().text;
                return 1;
            },
            visitImportDeclaration: (ctx) => {
                const qualifiedName = ctx.qualifiedName().text;
                importInfos.push({
                    identifier: qualifiedName.substring(qualifiedName.lastIndexOf('.') + 1),
                    qualifiedName: qualifiedName
                });
                return 1;
            },
            visitClassDeclaration: (ctx) => {
                const className = ctx.identifier().text;
                const startPos = this.document.positionAt(ctx.start.startIndex);
                const endPos = this.document.positionAt(ctx.stop?.stopIndex || ctx.start.startIndex);
                const identifierPos = this.document.positionAt(ctx.identifier().start.startIndex);

                classSymbol = {
                    name: className,
                    kind: 'class',
                    range: new Range(startPos, endPos),
                    identifierLocation: identifierPos,
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
            },
            visitEnumDeclaration: (ctx) => {
                console.log('visitEnumDeclaration');
                return 1;
            },
            visitInterfaceDeclaration: (ctx) => {
                console.log('visitInterfaceDeclaration');
                return 1;
            },
            visitAnnotationTypeDeclaration: (ctx) => {
                console.log('visitAnnotationTypeDeclaration');
                return 1;
            },
        });

        visitor.visit(ast);
        const modulePath = this.calculateModulePath(this.document.uri.fsPath, packageName);
        if (this.document.uri.fsPath.includes('Mapper')) {
            console.log('test');
        }
        if (!classSymbol) return undefined;
        return {
            modulePath,
            packageName,
            importInfos,
            classSymbol,
            qualifiedName: `${packageName}.${classSymbol.name}`,
            symbols,
            filePath: this.document.uri.fsPath
        };
    }

    private parseClassBody(classBody: any): JavaSymbol[] {
        const symbols: JavaSymbol[] = [];
        const visitor = createVisitor({
            visitMethodDeclaration: (ctx) => {
                const id = ctx.identifier();
                const name = id.text;
                const startPos = this.document.positionAt(ctx.start.startIndex);
                const endPos = this.document.positionAt(ctx.stop?.stopIndex || ctx.start.startIndex);
                const identifierPos = this.document.positionAt(id.start.startIndex);

                const methodSymbol: JavaSymbol = {
                    name,
                    kind: 'method',
                    range: new Range(startPos, endPos),
                    identifierLocation: identifierPos,
                    children: this.parseMethodParameters(ctx)
                };
                symbols.push(methodSymbol);
                return 1;
            },
            visitFieldDeclaration: (ctx) => {
                const variableDeclarators = ctx.variableDeclarators();
                for (const declarator of variableDeclarators.variableDeclarator()) {
                    const name = declarator.variableDeclaratorId().identifier().text;
                    const startPos = this.document.positionAt(declarator.start.startIndex);
                    const endPos = this.document.positionAt(declarator.stop?.stopIndex || declarator.start.startIndex);
                    const identifierPos = this.document.positionAt(declarator.variableDeclaratorId().start.startIndex);

                    symbols.push({
                        name,
                        kind: 'field',
                        range: new Range(startPos, endPos),
                        identifierLocation: identifierPos
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
                    const startPos = this.document.positionAt(param.start.startIndex);
                    const endPos = this.document.positionAt(param.stop?.stopIndex || param.start.startIndex);
                    const identifierPos = this.document.positionAt(id.start.startIndex);

                    parameters.push({
                        name,
                        kind: 'parameter',
                        range: new Range(startPos, endPos),
                        identifierLocation: identifierPos
                    });
                }
            }
        }
        return parameters;
    }

} 