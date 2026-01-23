import * as MagicString from 'magic-string';
import MagicString__default from 'magic-string';
import { RenderedChunk } from 'rollup';

type TReplaceOptions = {
    replaceFn: (code: MagicString__default, hash_length: number) => void;
    hash_length: number;
    enable_hash: boolean;
};
declare function replaceGlobKeyWithHash(targetFiles: string[], options?: Partial<TReplaceOptions>): {
    name: string;
    renderChunk(code: string, chunk: RenderedChunk): {
        code: string;
        map: MagicString.SourceMap;
    };
};

export { replaceGlobKeyWithHash as default };
