import { createVisitor } from 'java-ast';
import { JavaSymbol } from '../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from './baseVisitor';
import { MethodVisitor } from './methodVisitor';
import { FieldVisitor } from './fieldVisitor';

export class ClassVisitor {
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
            visitClassDeclaration: (ctx) => {
                const classSymbol = {
                    ...createBaseSymbol('class', ctx, this.context.document),
                    children: []
                } as JavaSymbol;

                this.context.symbols.push(classSymbol);

                // 访问类体，收集方法和字段
                const classBody = ctx.classBody();
                if (classBody) {
                    const classBodySymbols = this.parseClassBody(classBody);
                    classSymbol.children = classBodySymbols;
                }
                return 1;
            }
        });
    }

    private parseClassBody(classBody: any): JavaSymbol[] {
        const symbols: JavaSymbol[] = [];
        const methodVisitor = this.methodVisitor.createVisitor();
        const fieldVisitor = this.fieldVisitor.createVisitor();

        methodVisitor.visit(classBody);
        fieldVisitor.visit(classBody);

        return symbols;
    }
} 