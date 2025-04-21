import { JavaFileInfo } from '../../parser/javaAstParser';
import { WorkspaceManager } from '../../workspace/workspaceManager';
import { Location, Uri, Range, Position } from 'vscode';

export class ImportClassFinder {
    constructor(private workspaceManager: WorkspaceManager) { }

    public findImportedClass(fileInfo: JavaFileInfo, identifier: string): Location | undefined {
        // 检查导入的类
        for (const importInfo of fileInfo.importInfos) {
            if (importInfo.identifier === identifier) {
                const importedFileInfo = this.workspaceManager.get(fileInfo.modulePath, importInfo.qualifiedName);
                if (importedFileInfo) {
                    return this.createLocation(importedFileInfo);
                }
            }
        }

        // 检查同包下的类
        if (fileInfo.packageName) {
            const samePackageType = `${fileInfo.packageName}.${identifier}`;
            const samePackageFileInfo = this.workspaceManager.get(fileInfo.modulePath, samePackageType);
            if (samePackageFileInfo) {
                return this.createLocation(samePackageFileInfo);
            }
        }

        return undefined;
    }

    private createLocation(fileInfo: JavaFileInfo): Location {
        const startPos = fileInfo.classSymbol.identifierLocation;
        const endPos = new Position(
            startPos.line,
            startPos.character + fileInfo.classSymbol.name.length
        );
        return new Location(
            Uri.file(fileInfo.filePath),
            new Range(startPos, endPos)
        );
    }
} 