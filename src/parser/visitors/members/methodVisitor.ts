import { createVisitor, MethodDeclarationContext } from 'java-ast';
import { JavaSymbol } from '../../javaAstParser';
import { MemberVisitor } from './memberVisitor';

export class MethodVisitor extends MemberVisitor {

    public createVisitor() {
        return createVisitor({
            visitMethodDeclaration: (ctx) => {
                const returnType = ctx.typeTypeOrVoid();
                const typeName = returnType?.text || 'void';
                const methodSymbol = this.createSymbolWithType('method', ctx, typeName);
                methodSymbol.children = [
                    ...this.parseMethodParameters(ctx),
                    ...this.parseLocalVariables(ctx)
                ];
                this.symbols.push(methodSymbol);
                return 1;
            },
            visitInterfaceCommonBodyDeclaration: (ctx) => {
                const returnType = ctx.typeTypeOrVoid();
                const typeName = returnType?.text || 'void';
                const methodSymbol = this.createSymbolWithType('method', ctx, typeName);
                methodSymbol.children = this.parseMethodParameters(ctx);
                this.symbols.push(methodSymbol);
                return 1;
            },
            visitAnnotationMethodRest: (ctx) => {
                const methodSymbol = this.createSymbolWithType('method', ctx, 'void');
                methodSymbol.children = [];
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
                    const typeType = param.typeType();
                    const typeName = typeType?.text || '';
                    const ctx = param.variableDeclaratorId();
                    const parameterSymbol = this.createSymbolWithType('parameter', ctx, typeName);
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
                    const typeType = localVariableDeclaration.typeType();
                    const typeName = typeType?.text || '';
                    const variableDeclarators = localVariableDeclaration.variableDeclarators();
                    if (variableDeclarators) {
                        for (const declarator of variableDeclarators.variableDeclarator()) {
                            const variableDeclaratorId = declarator.variableDeclaratorId();
                            if (variableDeclaratorId) {
                                const localVariableSymbol = this.createSymbolWithType('localVariable', variableDeclaratorId, typeName);
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