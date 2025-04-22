import { JavaSymbol } from '../../javaAstParser';
import { BaseVisitorContext } from '../baseVisitor';

export abstract class MemberVisitor {
    protected context: BaseVisitorContext;
    protected symbols: JavaSymbol[] = [];

    constructor(context: BaseVisitorContext) {
        this.context = context;
    }

    public getSymbols(): JavaSymbol[] {
        return this.symbols;
    }
} 