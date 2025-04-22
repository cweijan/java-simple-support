import { TextDocument, Range } from 'vscode';
import { JavaSymbol, JavaSymbolKind } from '../javaAstParser';
import { ParserRuleContext } from 'antlr4ts';
import { IdentifierContext } from 'java-ast';

export interface BaseVisitorContext {
    document: TextDocument;
    symbols: JavaSymbol[];
}

export function createBaseSymbol<T extends ParserRuleContext>(
    kind: JavaSymbolKind,
    ctx: T & { identifier: () => IdentifierContext },
    document: TextDocument
): Partial<JavaSymbol> {
    const id = ctx.identifier();
    const identifierPos = document.positionAt(id.start.startIndex);
    const endPos = document.positionAt(ctx.stop?.stopIndex || ctx.start.startIndex);

    return {
        name: id.text,
        kind,
        range: new Range(identifierPos, endPos),
        identifierLocation: identifierPos
    };
}

export function createSymbolFromContext(
    name: string,
    kind: JavaSymbolKind,
    ctx: any,
    document: TextDocument,
    identifierCtx?: any
): Partial<JavaSymbol> {
    return createBaseSymbol(
        kind,
        ctx,
        document
    );
} 