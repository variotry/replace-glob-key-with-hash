import type { SetOptional } from 'type-fest';
import { shake } from "radash";
import { sha256 } from 'js-sha256';

const defaultHashLength : number = 12;

type _TOptions = {
    key: string,        // globにアクセスするキー（ファイル名など）
    hash: boolean,      // globキーのhashを有効化してビルドしているかどうか
    hash_length: number // ハッシュ文字列長の長さ
};

type TOptions = SetOptional<_TOptions, 'hash_length'>;

export default function getGlobFile<T>( globVal: Record<string, T>, globStr: string, options: TOptions ): T | undefined {
    const defaultOptions = {
        hash_length: defaultHashLength,
    };
    const { key, hash, hash_length } = { ...defaultOptions, ...shake( options ) } as _TOptions;

    if ( hash )
    {
        const m = globStr.match( /\*\*\/\*(\..+)$/ );
        const hash = sha256( m ? key + m[ 1 ] : key ).slice( 0, hash_length );
        return globVal[ hash ];
    }
    else
    {
        return globVal[ globStr.replace( /\*\*\/\*/, key ) ];
    }
}
