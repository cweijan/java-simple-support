import { DefinitionProvider, TextDocument, Position, Definition, Location, CancellationToken } from 'vscode';
import { WorkspaceManager } from '../workspace/workspaceManager';
import { JavaFileInfo, JavaSymbol } from '../parser/javaAstParser';

export class JavaDefinitionProvider implements DefinitionProvider {
    constructor(private workspaceManager: WorkspaceManager) { }

    public async provideDefinition(
        document: TextDocument,
        position: Position,
        token: CancellationToken
    ): Promise<Definition | undefined> {
        const fileInfo = this.workspaceManager.getByDocument(document);
        if (!fileInfo) {
            return undefined;
        }

        const offset = document.offsetAt(position);

        // 获取当前光标位置的单词
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }
        const word = document.getText(wordRange);

        // 根据单词和位置查找符号
        const symbol = this.findSymbolAtPosition(fileInfo, offset, word);

        if (symbol) {
            return new Location(
                document.uri,
                document.positionAt(symbol.identifierLocation || symbol.range.start)
            );
        }

        return undefined;
    }

    private findSymbolAtPosition(fileInfo: JavaFileInfo, position: number, word: string): JavaSymbol | undefined {
        const { symbols } = fileInfo;
        return this.findSymbolRecursive(symbols, position, word);
    }

    private findSymbolRecursive(symbols: JavaSymbol[], position: number, word: string): JavaSymbol | undefined {
        // 深度遍历
        for (const symbol of symbols) {
            if (position >= symbol.range.start && position <= symbol.range.end) {
                if (symbol.children) {
                    const child = this.findSymbolRecursive(symbol.children, position, word);
                    if (child) { return child; }
                }
                if (symbol.name === word) {
                    return symbol;
                }
            } else if (symbol.name === word) {
                return symbol;
            }
        }
        // 如果深度遍历找不到, 则进行广度遍历
        for (const symbol of symbols) {
            if (symbol.name === word) {
                return symbol;
            }
        }
        return undefined;
    }


}