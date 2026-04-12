import * as magic_string from 'magic-string';
import { RenderedChunk } from 'rolldown';
import { TReplaceOptions } from './vite-plugin.cjs';
import 'rollup';

declare function includeFile(chunk: RenderedChunk, targetFiles: string[]): boolean;
declare function replaceGlobKeyWithHash(targetFiles: string[], options?: Partial<TReplaceOptions>): {
    name: string;
    renderChunk(code: string, chunk: RenderedChunk): {
        code: string;
        map: magic_string.SourceMap;
    };
};

export { replaceGlobKeyWithHash as default, includeFile };
