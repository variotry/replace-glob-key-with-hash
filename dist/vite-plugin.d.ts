import * as magic_string from 'magic-string';
import magic_string__default from 'magic-string';
import { RenderedChunk } from 'rollup';

declare const defaultHashLength: number;
declare function genHash(src: string, length: number): string;
/**
 * import.meta.glob で「'PrefixDir/＊＊/＊.ext'」 のような
 * PrefixDir部分を展開されたファイル群から取得する。
 * ただ、正確なPrefixDirの取得には、該当ディレクトリ（PrefixDir以下）に
 * 2エントリ以上のファイルが必要になる（運用仕様とする必要がある）
 * NG例：PrefixDir 直下に 1ファイル(+空のディレクトリ) or 1ディレクトリしかない場合は NGとなる。
 */
declare function getPrefix(matches: RegExpMatchArray | string[] | null): string;
declare function includeFile(chunk: RenderedChunk, targetFiles: string[]): boolean;
type TReplaceOptions = {
    replaceFn: (code: magic_string__default, hash_length: number) => void;
    hash: boolean;
    hash_length: number;
};
declare function replaceGlobKeyWithHash(targetFiles: string[], options?: Partial<TReplaceOptions>): {
    name: string;
    renderChunk(code: string, chunk: RenderedChunk): {
        code: string;
        map: magic_string.SourceMap;
    };
};

export { type TReplaceOptions, replaceGlobKeyWithHash as default, defaultHashLength, genHash, getPrefix, includeFile };
