import { JavaFileInfo } from '../parser/javaAstParser';
import { TextDocument } from 'vscode';

export class JavaFileCache {
    private pathCache: { [key: string]: JavaFileInfo } = {};
    private cache: { [key: string]: { [key: string]: JavaFileInfo } } = {};


    public getByFilePath(filePath: string): JavaFileInfo | undefined {
        return this.pathCache[filePath];
    }

    public get(modulePath: string, qualifiedName: string): JavaFileInfo | undefined {
        return this.cache[modulePath]?.[qualifiedName];
    }

    public set(filePath: string, modulePath: string, qualifiedName: string, info: JavaFileInfo): void {
        if (!this.cache[modulePath]) {
            this.cache[modulePath] = {};
        }
        this.pathCache[filePath] = info;
        this.cache[modulePath][qualifiedName] = info;
    }

    public delete(modulePath: string, qualifiedName: string): void {
        if (this.cache[modulePath]) {
            delete this.cache[modulePath][qualifiedName];
        }
    }

    public clear(): void {
        this.cache = {};
    }

} 