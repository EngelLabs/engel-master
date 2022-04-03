import type * as dotenv from 'dotenv';

declare namespace env {
        export interface ConfigOptions extends dotenv.DotenvConfigOptions {
                ignoreFallbacks?: boolean;
                ignoreMissing?: boolean;
        }

        type ParseType = 'str' | 'int' | 'bool';
        type ParseTypeMapping<T extends ParseType> =
                T extends 'str' ? string :
                T extends 'int' ? number :
                T extends 'bool' ? boolean :
                never;

        type StringConverter = (key: string, fallback?: string) => string;
        type NumberConverter = (key: string, fallback?: number) => number;
        type BooleanConverter = (key: string, fallback?: boolean) => boolean;
        type ArrayConverter = <T extends ParseType = 'str'>(key: string, type?: T, fallback?: Array<ParseTypeMapping<T>>) => Array<ParseTypeMapping<T>>;

        export function load(): typeof env;
        export function config(options: ConfigOptions): typeof env;

        export const str: StringConverter;
        export const int: NumberConverter;
        export const bool: BooleanConverter;
        export const arr: ArrayConverter;

        export const string: StringConverter;
        export const integer: NumberConverter;
        export const boolean: BooleanConverter;
        export const array: ArrayConverter;

        export const Env: new (options?: ConfigOptions) => typeof env;
}

export = env;
