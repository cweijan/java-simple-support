import { createVisitor, MethodDeclarationContext } from 'java-ast';
import { JavaSymbol } from '../../javaAstParser';
import { createBaseSymbol } from '../baseVisitor';
import { MemberVisitor } from './memberVisitor';

export class MethodVisitor extends MemberVisitor {

    public createVisitor() {
        return createVisitor({
            visitMethodDeclaration: (ctx) => {
                const methodSymbol = {
                    ...createBaseSymbol('method', ctx, this.context.document),
                    children: [
                        ...this.parseMethodParameters(ctx),
                        ...this.parseLocalVariables(ctx)
                    ]
                } as JavaSymbol;

                this.symbols.push(methodSymbol);
                return 1;
            },
            visitInterfaceCommonBodyDeclaration: (ctx) => {
                const methodSymbol = {
                    ...createBaseSymbol('method', ctx, this.context.document),
                    children: this.parseMethodParameters(ctx)
                } as JavaSymbol;

                this.symbols.push(methodSymbol);
                return 1;
            },
            visitAnnotationMethodRest: (ctx) => {
                const methodSymbol = {
                    ...createBaseSymbol('method', ctx, this.context.document),
                    children: []
                } as JavaSymbol;

                this.symbols.push(methodSymbol);
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

    private parseLocalVariables(ctx: MethodDeclarationContext): JavaSymbol[] {
        const localVariables: JavaSymbol[] = [];
        const block = ctx.methodBody()?.block();
        if (block) {
            for (const blockStatement of block.blockStatement()) {
                const localVariableDeclaration = blockStatement.localVariableDeclaration();
                if (localVariableDeclaration) {
                    const variableDeclarators = localVariableDeclaration.variableDeclarators();
                    if (variableDeclarators) {
                        for (const declarator of variableDeclarators.variableDeclarator()) {
                            const variableDeclaratorId = declarator.variableDeclaratorId();
                            if (variableDeclaratorId) {
                                const localVariableSymbol = {
                                    ...createBaseSymbol('localVariable', variableDeclaratorId, this.context.document)
                                } as JavaSymbol;
                                localVariables.push(localVariableSymbol);
                            }
                        }
                    }
                }
            }
        }
        return localVariables;
    }
} 