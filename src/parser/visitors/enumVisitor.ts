import { createVisitor } from 'java-ast';
import { JavaSymbol } from '../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from './baseVisitor';
import { MethodVisitor } from './methodVisitor';
import { FieldVisitor } from './fieldVisitor';

export class EnumVisitor {
    private context: BaseVisitorContext;
    private methodVisitor: MethodVisitor;
    private fieldVisitor: FieldVisitor;

    constructor(context: BaseVisitorContext) {
        this.context = context;
        this.methodVisitor = new MethodVisitor(context);
        this.fieldVisitor = new FieldVisitor(context);
    }

    public createVisitor() {
        return createVisitor({
            visitEnumDeclaration: (ctx) => {
                const enumSymbol = {
                    ...createBaseSymbol('enum', ctx, this.context.document),
                    children: []
                } as JavaSymbol;

                this.context.symbols.push(enumSymbol);

                // 访问枚举体，收集枚举常量
                const enumBody = ctx.children?.find(child => child.constructor.name === 'EnumBodyContext');
                if (enumBody) {
                    const enumBodySymbols = this.parseEnumBody(enumBody);
                    enumSymbol.children = enumBodySymbols;
                }
                return 1;
            }
        });
    }

    private parseEnumBody(enumBody: any): JavaSymbol[] {
        const symbols: JavaSymbol[] = [];
        const methodVisitor = this.methodVisitor.createVisitor();
        const fieldVisitor = this.fieldVisitor.createVisitor();

        methodVisitor.visit(enumBody);
        fieldVisitor.visit(enumBody);

        return symbols;
    }
} 