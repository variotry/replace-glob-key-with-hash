import { SetOptional } from 'type-fest';

type _TOptions = {
    key: string;
    hash: boolean;
    hash_length: number;
};
type TOptions = SetOptional<_TOptions, 'hash_length'>;
declare function getGlobFile<T>(globVal: Record<string, T>, globStr: string, options: TOptions): T | undefined;

export { getGlobFile as default };
