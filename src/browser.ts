import { sha256 } from 'js-sha256';
import type { SetOptional, SetRequired } from 'type-fest';
import { TReplaceOptions } from "./node.js";

export type TGlobEagerAssets = {
    default: string;
};

type _TOptions = {
    prefix: string,  // globで指定した「/**」より左側のprefix文字列
    ext: string,    // globで指定した「*.ext」の.ext部分（ドットも含めること）
    hashed_fileName: boolean,   // ファイル名がすでにハッシュ化されているかどうか
    hash_enable: boolean,    // globのキーがハッシュ化されているかどうか（viteビルド結果による）
    hash_length: number      // ハッシュ文字列長の長さ
};

//export type TOptions = SetOptional<_TOptions, 'ext' | 'hashed_fileName' | 'hash_enable' | 'hash_length'>;
export type TOptions = SetRequired< Partial<_TOptions>, 'prefix' >;

export default function getImportData<T>( globResult: Record<string, T>, fileName: string, _options: TOptions ): T | undefined {
    const defaultOptions: _TOptions = {
        prefix: "",
        ext: "",
        hashed_fileName: false,
        hash_enable: true,
        hash_length: 12
    };
    const options : _TOptions = { ...defaultOptions, ..._options };

    if ( options.hash_enable )
    {
        if ( options.hashed_fileName )
        {
            return globResult[ fileName ];
        }
        const hash = sha256( fileName ).slice( 0, options.hash_length );
        return globResult[ hash ];
    }
    else
    {
        return globResult[ options.prefix + fileName + ( options.ext ?? "" ) ];
    }
}