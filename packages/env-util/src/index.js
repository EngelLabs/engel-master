const path = require('path');

/* eslint-disable-next-line new-parens */
const NULL = new (class NULL { [Symbol] });

const converters = {
        str: value => {
                return typeof value === 'string' ? value : NULL;
        },
        int: value => {
                if (typeof value !== 'string') {
                        return NULL;
                }

                const ret = Number(value);

                if (isNaN(ret)) {
                        return NULL;
                }

                return ret;
        },
        bool: value => {
                switch (typeof value === 'string' ? value.toLowerCase() : value) {
                        case '1':
                                return true;
                        case '0':
                                return false;
                        case 'y':
                        case 'yes':
                                return true;
                        case 'n':
                        case 'no':
                                return false;
                        case 't':
                        case 'true':
                                return true;
                        case 'f':
                        case 'false':
                                return false;
                        default:
                                return NULL;
                }
        }
};

const createConvertionMethod = (type, constructor) => {
        return function (key, fallback = NULL, ...extraArgs) {
                return this._getEnv(key, fallback, converters[type], constructor, ...extraArgs);
        };
};

class Env {
        _config = {
                ignoreFallbacks: false,
                ignoreMissing: false,
                path: path.join(process.cwd(), '../../.env')
        };

        constructor(options) {
                this.config(options);
        }

        _getEnv(key, fallback, converter, constructor, ...extraArgs) {
                if (this._config.ignoreFallbacks) {
                        fallback = NULL;
                }

                if (!Object.prototype.hasOwnProperty.call(process.env, key)) {
                        if (fallback === NULL) {
                                if (this._config.ignoreMissing) {
                                        return;
                                }

                                throw new Error(`process.env.${key} is undefined.`);
                        }

                        return fallback;
                }

                const ret = converter(process.env[key], ...extraArgs);

                if (ret === NULL || ret instanceof Error) {
                        if (this._config.ignoreErrors) {
                                return fallback;
                        }

                        throw new Error(
                                `process.env.${key}: "${process.env[key]}" could not be converted to "${constructor.name}".`
                        );
                }

                return ret;
        }

        load() {
                const { error } = require('dotenv').config(this._config);

                if (error) {
                        throw error;
                }

                return this;
        }

        config(options) {
                this._config = Object.assign(this._config, options);

                return this;
        }

        /* Conversion methods */
        str = createConvertionMethod('str', String);
        int = createConvertionMethod('int', Number);
        bool = createConvertionMethod('bool', Boolean);
        arr(key, type = 'str', fallback = NULL) {
                const converter = (value, type = 'str') => {
                        const arr = value.split(',');

                        const ret = arr.map(converters[type]);

                        const idx = ret.findIndex(o => o === NULL);

                        if (idx !== -1) {
                                throw new Error(
                                        `process.env.${key}.${idx}: Array element "${arr[idx]}" could not be converted to "${type}"`
                                );
                        }

                        return ret;
                };

                return this._getEnv(key, fallback, converter, Array, type);
        }

        /* Aliases */
        string = this.str;
        integer = this.int;
        boolean = this.bool;
}

const env = new Env();

try {
        env.load();
} catch { }

module.exports = env;

module.exports.Env = Env;
