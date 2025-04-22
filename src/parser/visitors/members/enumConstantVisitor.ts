import { createVisitor } from 'java-ast';
import { MemberVisitor } from './memberVisitor';

export class EnumConstantVisitor extends MemberVisitor {

    public createVisitor() {
        return createVisitor({
            visitEnumConstant: (ctx) => {
                const enumConstantSymbol = this.createSymbolWithType('enum', ctx, '');
                enumConstantSymbol.children = [];
                this.symbols.push(enumConstantSymbol);
                return 1;
            }
        });
    }

}