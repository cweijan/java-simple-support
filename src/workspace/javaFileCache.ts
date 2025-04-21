import { JavaFileInfo } from '../parser/javaAstParser';
import { TextDocument } from 'vscode';

export class JavaFileCache {
    private pathCache: { [key: string]: JavaFileInfo } = {};
    private cache: { [key: string]: { [key: string]: JavaFileInfo } } = {};


    public getByFilePath(filePath: string): JavaFileInfo | undefined {
        return this.pathCache[filePath];
    }

    public get(modulePath: string, className: string): JavaFileInfo | undefined {
        return this.cache[modulePath]?.[className];
    }

    public set(filePath: string, modulePath: string, className: string, info: JavaFileInfo): void {
        if (!this.cache[modulePath]) {
            this.cache[modulePath] = {};
        }
        this.pathCache[filePath] = info;
        this.cache[modulePath][className] = info;
    }

    public delete(modulePath: string, className: string): void {
        if (this.cache[modulePath]) {
            delete this.cache[modulePath][className];
        }
    }

    public clear(): void {
        this.cache = {};
    }

} 