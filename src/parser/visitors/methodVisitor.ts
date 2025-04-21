import { createVisitor, MethodDeclarationContext } from 'java-ast';
import { JavaSymbol } from '../javaAstParser';
import { BaseVisitorContext, createBaseSymbol } from './baseVisitor';

export class MethodVisitor {
    private context: BaseVisitorContext;

    constructor(context: BaseVisitorContext) {
        this.context = context;
    }

    public createVisitor() {
        return createVisitor({
            visitMethodDeclaration: (ctx) => {
                const methodSymbol = {
                    ...createBaseSymbol('method', ctx, this.context.document),
                    children: this.parseMethodParameters(ctx)
                } as JavaSymbol;

                this.context.symbols.push(methodSymbol);
                return 1;
            }
        });
    }

    private parseMethodParameters(ctx: MethodDeclarationContext): JavaSymbol[] {
        const parameters: JavaSymbol[] = [];
        const formalParameters = ctx.formalParameters();
        if (formalParameters) {
            const parameterList = formalParameters.formalParameterList();
            if (parameterList) {
                for (const param of parameterList.formalParameter()) {
                    const ctx = param.variableDeclaratorId();
                    const parameterSymbol = { ...createBaseSymbol('parameter', ctx, this.context.document) } as JavaSymbol;
                    parameters.push(parameterSymbol);
                }
            }
        }
        return parameters;
    }
} 