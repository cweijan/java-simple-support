import { createVisitor, InterfaceBodyContext } from '@/parser/java-ast';
import { JavaSymbol } from '../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from './baseVisitor';
import { MethodVisitor } from './members/methodVisitor';

export class InterfaceVisitor {
    private context: BaseVisitorContext;
    private methodVisitor: MethodVisitor;

    constructor(context: BaseVisitorContext) {
        this.context = context;
        this.methodVisitor = new MethodVisitor(context);
    }

    public createVisitor() {
        return createVisitor({
            visitInterfaceDeclaration: (ctx) => {
                const interfaceSymbol = {
                    ...createBaseSymbol('interface', ctx, this.context.document),
                    children: []
                } as JavaSymbol;

                this.context.symbols.push(interfaceSymbol);

                // 访问接口体，收集方法
                const interfaceBody = ctx.interfaceBody();
                if (interfaceBody) {
                    const interfaceBodySymbols = this.parseInterfaceBody(interfaceBody);
                    interfaceSymbol.children = interfaceBodySymbols;
                }
                return 1;
            }
        });
    }

    private parseInterfaceBody(interfaceBody: InterfaceBodyContext): JavaSymbol[] {
        const methodVisitor = this.methodVisitor.createVisitor();
        methodVisitor.visit(interfaceBody);
        return this.methodVisitor.getSymbols();
    }
} 