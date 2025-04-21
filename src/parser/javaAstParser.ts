import { parse, createVisitor } from 'java-ast';
import { TextDocument, Range, Location, Uri, Position } from 'vscode';
import { ClassVisitor } from './visitors/classVisitor';
import { BaseVisitorContext } from './visitors/baseVisitor';

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

        const context: BaseVisitorContext = {
            document: this.document,
            symbols
        };

        const classVisitor = new ClassVisitor(context);
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
            }
        });

        visitor.visit(ast);
        classVisitor.createVisitor().visit(ast);

        const modulePath = this.calculateModulePath(this.document.uri.fsPath, packageName);
        classSymbol = symbols.find(s => s.kind === 'class');

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

} 