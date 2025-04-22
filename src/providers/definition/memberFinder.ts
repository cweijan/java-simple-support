import { Position, Location, Uri } from 'vscode';
import { TextDocument } from 'vscode';
import { WorkspaceManager } from '../../workspace/workspaceManager';
import { JavaFileInfo, JavaSymbol } from '../../parser/javaAstParser';

export class MemberFinder {
    constructor(private workspaceManager: WorkspaceManager) { }

    public async findMember(currentFileInfo: JavaFileInfo, memberName: string, className: string): Promise<Location | undefined> {
        let lombokFieldName = memberName.replace(/^(get|set)/, '');
        if (lombokFieldName.length > 0) {
            lombokFieldName = lombokFieldName.charAt(0).toLowerCase() + lombokFieldName.slice(1);
        }
        for (const importInfo of currentFileInfo.importInfos) {
            if (importInfo.identifier === className) {
                const fileInfo = this.workspaceManager.get(currentFileInfo.modulePath, importInfo.qualifiedName);
                if (fileInfo) {
                    return this.findMemberInSymbols(fileInfo.symbols, memberName, lombokFieldName, fileInfo.uri);
                }
            }
        }

        if (currentFileInfo.packageName) {
            const qualifiedName = `${currentFileInfo.packageName}.${className}`;
            const fileInfo = this.workspaceManager.get(currentFileInfo.modulePath, qualifiedName);
            if (fileInfo) {
                return this.findMemberInSymbols(fileInfo.symbols, memberName, lombokFieldName, fileInfo.uri);
            }
        }

        return undefined;
    }

    private findMemberInSymbols(symbols: JavaSymbol[], memberName: string, lombokFieldName: string, uri: string): Location | undefined {
        for (const symbol of symbols) {
            if (symbol.name === memberName && ['method', 'field', 'enum'].includes(symbol.kind)) {
                return new Location(Uri.parse(uri), symbol.range);
            } else if (symbol.name === lombokFieldName && symbol.kind === 'field') {
                return new Location(Uri.parse(uri), symbol.range);
            }

            if (symbol.children) {
                const result = this.findMemberInSymbols(symbol.children, memberName, lombokFieldName, uri);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }

    public getTypeNameAtPosition(document: TextDocument, position: Position): string | undefined {
        const line = document.lineAt(position.line);
        const text = line.text;

        let start = position.character - 1;
        while (start >= 0 && /[a-zA-Z0-9_.]/.test(text[start])) {
            start--;
        }
        start++;

        const typeName = text.substring(start, position.character);
        return typeName;
    }

} 