import { createVisitor } from '@/parser/java-ast';
import { MemberVisitor } from './memberVisitor';

export class FieldVisitor extends MemberVisitor {
    public createVisitor() {
        return createVisitor({
            visitFieldDeclaration: (ctx) => {
                const typeType = ctx.typeType();
                const typeName = typeType?.text || '';
                const variableDeclarators = ctx.variableDeclarators();
                for (const declarator of variableDeclarators.variableDeclarator()) {
                    const ctx = declarator.variableDeclaratorId();
                    const fieldSymbol = this.createSymbolWithType('field', ctx, typeName);
                    this.symbols.push(fieldSymbol);
                }
                return 1;
            }
        });
    }
} 