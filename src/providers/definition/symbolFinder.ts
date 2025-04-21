import { JavaFileInfo, JavaSymbol } from '../../parser/javaAstParser';
import { Position } from 'vscode';

export class SymbolFinder {
    public findSymbolAtPosition(fileInfo: JavaFileInfo, position: Position, word: string): JavaSymbol | undefined {
        const { symbols } = fileInfo;
        const symbol = this.findSymbolRecursive(symbols, position, word);
        if (symbol) {
            // 判断position是否在identity区间，如果是返回null
            if (position.isAfterOrEqual(symbol.identifierLocation) &&
                position.isBeforeOrEqual(new Position(
                    symbol.identifierLocation.line,
                    symbol.identifierLocation.character + symbol.name.length
                ))) {
                return null;
            }
        }
        return symbol;
    }

    private findSymbolRecursive(symbols: JavaSymbol[], position: Position, word: string): JavaSymbol | undefined {
        // 深度遍历
        for (const symbol of symbols) {
            if (position.isAfterOrEqual(symbol.range.start) && position.isBeforeOrEqual(symbol.range.end)) {
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