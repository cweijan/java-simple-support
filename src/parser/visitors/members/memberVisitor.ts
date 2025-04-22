import { JavaSymbol, JavaSymbolKind } from '../../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from '../baseVisitor';

export abstract class MemberVisitor {
    protected context: BaseVisitorContext;
    protected symbols: JavaSymbol[] = [];

    constructor(context: BaseVisitorContext) {
        this.context = context;
    }

    public getSymbols(): JavaSymbol[] {
        return this.symbols;
    }

    protected createSymbolWithType(kind: JavaSymbolKind, ctx: any, typeName: string): JavaSymbol {
        return {
            ...createBaseSymbol(kind, ctx, this.context.document),
            typeName
        } as JavaSymbol;
    }
} 