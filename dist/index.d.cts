import { SetOptional } from 'type-fest';

type _TOptions = {
    key: string;
    enabled_hash: boolean;
    hash_length: number;
};
type TOptions = SetOptional<_TOptions, 'hash_length'>;
declare function getGrobFile<T>(globVal: Record<string, T>, globStr: string, options: TOptions): T | undefined;

export { getGrobFile as default };
