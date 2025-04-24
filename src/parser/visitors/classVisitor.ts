import { ClassBodyContext, createVisitor } from '@/parser/java-ast';
import { JavaSymbol } from '../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from './baseVisitor';
import { MethodVisitor } from './members/methodVisitor';
import { FieldVisitor } from './members/fieldVisitor';
import { SymbolKind } from 'vscode';

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
                    ...createBaseSymbol(SymbolKind.Class, ctx, this.context.document),
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

    private parseClassBody(classBody: ClassBodyContext): JavaSymbol[] {
        const methodVisitor = this.methodVisitor.createVisitor();
        const fieldVisitor = this.fieldVisitor.createVisitor();

        methodVisitor.visit(classBody);
        fieldVisitor.visit(classBody);

        return [
            ...this.methodVisitor.getSymbols(),
            ...this.fieldVisitor.getSymbols()
        ];
    }
} 