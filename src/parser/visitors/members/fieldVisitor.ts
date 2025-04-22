import { createVisitor } from 'java-ast';
import { JavaSymbol } from '../../javaAstParser';
import { createBaseSymbol } from '../baseVisitor';
import { MemberVisitor } from './memberVisitor';

export class FieldVisitor extends MemberVisitor {
    public createVisitor() {
        return createVisitor({
            visitFieldDeclaration: (ctx) => {
                const variableDeclarators = ctx.variableDeclarators();
                for (const declarator of variableDeclarators.variableDeclarator()) {
                    const ctx = declarator.variableDeclaratorId();
                    const fieldSymbol = {
                        ...createBaseSymbol('field', ctx, this.context.document)
                    } as JavaSymbol;
                    this.symbols.push(fieldSymbol);
                }
                return 1;
            }
        });
    }
} 