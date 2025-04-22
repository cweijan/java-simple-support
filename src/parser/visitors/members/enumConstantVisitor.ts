import { createVisitor } from 'java-ast';
import { JavaSymbol } from '../../javaAstParser';
import { createBaseSymbol } from '../baseVisitor';
import { MemberVisitor } from './memberVisitor';

export class EnumConstantVisitor extends MemberVisitor {

    public createVisitor() {
        return createVisitor({
            visitEnumConstant: (ctx) => {
                const enumConstantSymbol = {
                    ...createBaseSymbol('enum', ctx, this.context.document),
                    children: []
                } as JavaSymbol;

                this.symbols.push(enumConstantSymbol);
                return 1;
            }
        });
    }

}