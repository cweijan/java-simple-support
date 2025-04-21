import { CompletionItemProvider, TextDocument, Position, CompletionItem, CompletionItemKind, CancellationToken } from 'vscode';
import { WorkspaceManager } from '../workspace/workspaceManager';

export class JavaCompletionProvider implements CompletionItemProvider {
    private keywords = [
        'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch',
        'char', 'class', 'const', 'continue', 'default', 'do', 'double',
        'else', 'enum', 'extends', 'final', 'finally', 'float', 'for',
        'if', 'implements', 'import', 'instanceof', 'int', 'interface',
        'long', 'native', 'new', 'package', 'private', 'protected', 'public',
        'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized',
        'this', 'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while'
    ];

    constructor(private workspaceManager: WorkspaceManager) { }

    public async provideCompletionItems(
        document: TextDocument,
        position: Position,
        token: CancellationToken
    ): Promise<CompletionItem[]> {
        const fileInfo = this.workspaceManager.getByDocument(document);
        const items: CompletionItem[] = [];

        // 添加关键字补全
        this.keywords.forEach(keyword => {
            items.push(new CompletionItem(keyword, CompletionItemKind.Keyword));
        });

        // 添加当前文档中的符号补全
        if (fileInfo) {
            fileInfo.symbols.forEach(symbol => {
                items.push(new CompletionItem(symbol.name, this.getCompletionKind(symbol.kind)));
            });
        }

        return items;
    }

    private getCompletionKind(kind: string): CompletionItemKind {
        switch (kind) {
            case 'class':
                return CompletionItemKind.Class;
            case 'method':
                return CompletionItemKind.Method;
            case 'field':
                return CompletionItemKind.Field;
            default:
                return CompletionItemKind.Variable;
        }
    }
} 