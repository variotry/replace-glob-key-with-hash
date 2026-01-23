import { sha256 } from 'js-sha256';
import MagicString from 'magic-string';
import { shake } from "radash";
import type { RenderedChunk } from 'rollup';

const defaultHashLength : number = 12;

function genHash( src: string, length: number ): string
{
    return sha256( src )
        .slice( 0, length );
}

/**
 * import.meta.glob で「'PrefixDir/＊＊/＊.ext'」 のような
 * PrefixDir部分を展開されたファイル群から取得する。
 * ただ、正確なPrefixDirの取得には、該当ディレクトリ（PrefixDir以下）に
 * 2エントリ以上のファイルが必要になる（運用仕様とする必要がある）
 * NG例：PrefixDir 直下に 1ファイル(+空のディレクトリ) or 1ディレクトリしかない場合は NGとなる。
 */
function getPrefix( matches: RegExpMatchArray | null ): string
{
    if ( matches == null || matches.length == 0 )
    {
        return "";
    }
    let prefix = "";
    let currentChar = "";
    let currentIndex = 0;
    let loop = true;
    do
    {
        for ( let i = 0; i < matches.length; ++i )
        {
            if ( i == 0 )
            {
                currentChar = matches[ 0 ].charAt( currentIndex );
                if ( !currentChar )
                {
                    loop = false;
                    break;
                }
            }
            else
            {
                let c = matches[ i ];
                if ( !c || c.charAt( currentIndex ) != currentChar )
                {
                    loop = false;
                    break;
                }
            }
            if ( i == matches.length - 1 )
            {
                prefix += currentChar;
                ++currentIndex;
            }
        }
    } while ( loop );

    return prefix;
}

function hashGlobKey( code: MagicString, hash_length: number )
{
    code.replace( /(.+)(\/\*\s*#__PURE__\s*\*\/\s*Object\.assign)(.+)/g, ( original: string, $1: string, $2: string, $3: string ) => {
        // この段階で、$3は import.meta.glob の展開された行（厳密には Object.assign より右側の文字列）に限定されている
        // $2 の コロン「:」を含まない ダブルクォートで囲まれた文字列が置換対象となる
        if ( $1.match( /no_hash/ ) )    // 変数宣言周りに no_hashの文字列があったら置換しない
        {
            return original;
        }

        const pattern = /("[^:]+")/g;
        const matches = $3.match( pattern );
        const prefix = getPrefix( matches );

        return $1 + $2 + $3.replace( /("[^:]+")/g, ( original: string, $1: string ) => {
            let fileName = $1.replace( prefix, "" )
                .replace( /"$/, '' );
            //console.log( 'fileName', fileName, genHash( fileName, hash_length ) );
            return `'${ genHash( fileName, hash_length ) }'`;
        } );
    } );
    return code;
}


function includeFile( chunk: RenderedChunk, targetFiles: string[] )
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

type TReplaceOptions = {
    replaceFn: ( code: MagicString, hash_length: number ) => void,
    hash: boolean
    hash_length: number,
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