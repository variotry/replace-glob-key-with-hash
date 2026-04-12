import { sha256 } from 'js-sha256';
import MagicString from 'magic-string';
import { shake } from "radash";
import type { RenderedChunk } from 'rolldown';
import { getPrefix, genHash, defaultHashLength, type TReplaceOptions } from "./vite-plugin.js";

function hashGlobKey( code: MagicString, hash_length: number )
{
    // rolldown用に用意
    // ＃__PURE__ から ＠__PURE__ になってたり、改行されているなどかなり形式が変わっている。
    // ↑（＃、＠を小文字で書くと、コメント内でもビルド結果がおかしくなるので注意）
    code.replace( /(.+)(\/\*\s*@__PURE__\s*\*\/\s*Object\.assign\({)(.+)(}\))/s, ( original: string, $1: string, $2: string, $3: string, $4: string ) => {

        // $3 が "**.vue": () => xxxx, の複数行入ったもの
        // "**.vue"などをハッシュ化する

        if ( $1.match( /no_hash/ ) )    // 変数宣言周りに no_hashの文字列があったら置換しない
        {
            return original;
        }

        // "**.vue" でのみ構成された配列文字列を用意
        const pattern = /("[^:]+")(:.+\n)/g;
        const matches = [...$3.matchAll(pattern)].map(match => {
            return match[1];
        });

        // 配列文字列から、./Pages/**/*.vue などの共通プレフィックス（例だと ./Pages/ となる）を取得
        const prefix = getPrefix( matches );

        $3 = $3.replace( pattern, ( original: string, $1:string, $2:string ) => {
            // prefix を除くファイル名部分をハッシュ化して返す
            let fileName = $1.replace( prefix, "" )
                .replace( /"$/, '' );
            return `'${ genHash( fileName, hash_length ) }'` + $2;
        } );
        return $1 + $2 + $3 + $4;
    } );
    return code;
}

export function includeFile( chunk: RenderedChunk, targetFiles: string[] )
{
    return Object.keys( chunk.modules ).some( mid => {
        for ( let i = 0; i < targetFiles.length; ++i )
        {
            const s = targetFiles[ i ];
            if ( s === undefined )
            {
                continue;
            }

            if ( mid.endsWith( s ) )
            {
                return true;
            }
        }
        return false;
    } );
}

export default function replaceGlobKeyWithHash( targetFiles: string[], options?: Partial<TReplaceOptions> )
{
    const defaultOptions: TReplaceOptions = {
        replaceFn: hashGlobKey,
        hash: true,
        hash_length: defaultHashLength
    };
    const { replaceFn, hash, hash_length } = {
        ...defaultOptions,
        ...shake( options )
    };

    return {
        name: 'vt-replace-glob-key-with-hash',
        renderChunk( code: string, chunk: RenderedChunk )
        {
            if ( !hash|| !includeFile( chunk, targetFiles ) )
            {
                return null;
            }

            let s = new MagicString( code );
            replaceFn( s, hash_length );

            return {
                code: s.toString(),
                map: s.generateMap( { hires: true } )
            };
        }
    }
}