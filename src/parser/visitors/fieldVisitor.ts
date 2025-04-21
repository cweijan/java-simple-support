import { createVisitor } from 'java-ast';
import { JavaSymbol } from '../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from './baseVisitor';

export class FieldVisitor {
    private context: BaseVisitorContext;

    constructor(context: BaseVisitorContext) {
        this.context = context;
    }

    public createVisitor() {
        return createVisitor({
            visitFieldDeclaration: (ctx) => {
                const variableDeclarators = ctx.variableDeclarators();
                for (const declarator of variableDeclarators.variableDeclarator()) {
                    const ctx = declarator.variableDeclaratorId();
                    const fieldSymbol = {
                        ...createBaseSymbol('field', ctx, this.context.document)
                    } as JavaSymbol;
                    this.context.symbols.push(fieldSymbol);
                }
                return 1;
            }
        });
    }
} 