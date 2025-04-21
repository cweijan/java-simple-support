import { DefinitionProvider, TextDocument, Position, Definition, Location, CancellationToken } from 'vscode';
import { JavaAstParser } from '../parser/javaAstParser';

export class JavaDefinitionProvider implements DefinitionProvider {
    public async provideDefinition(
        document: TextDocument,
        position: Position,
        token: CancellationToken
    ): Promise<Definition | undefined> {
        const parser = new JavaAstParser(document);
        const offset = document.offsetAt(position);

        // 获取当前光标位置的单词
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }
        const word = document.getText(wordRange);

        // 根据单词和位置查找符号
        const symbol = parser.findSymbolAtPosition(offset, word);

        if (symbol) {
            return new Location(
                document.uri,
                document.positionAt(symbol.range.start)
            );
        }

        return undefined;
    }
}