const path = require('path');

/* eslint-disable-next-line new-parens */
const NULL = new function NULL() { };

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

const createConversionMethod = (type, constructor) => {
        return function (key, fallback = NULL, ...extraArgs) {
                return this._getEnv(key, fallback, converters[type], constructor, ...extraArgs);
        };
};

function Env(options) {
        if (!(this instanceof Env)) {
                return new Env(options);
        }

        this._config = {
                ignoreFallbacks: false,
                ignoreMissing: false,
                path: path.join(process.cwd(), '../../.env')
        };
        this.config(options);
}

Env.prototype.Env = Env.Env = Env;

Env.prototype._getEnv = function (key, fallback, converter, constructor, ...extraArgs) {
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
};

Env.prototype.load = function load() {
        const { error } = require('dotenv').config(this._config);

        if (error) {
                throw error;
        }

        return this;
};

Env.prototype.config = function config(options) {
        this._config = Object.assign(this._config, options);

        return this;
};

/* Conversion methods */
Env.prototype.string = Env.prototype.str = createConversionMethod('str', String);
Env.prototype.integer = Env.prototype.int = createConversionMethod('int', Number);
Env.prototype.boolean = Env.prototype.bool = createConversionMethod('bool', Boolean);
Env.prototype.array = Env.prototype.arr = function (key, type = 'str', fallback = NULL) {
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
};

const env = new Env();

try {
        env.load();
} catch { }

module.exports = env;
