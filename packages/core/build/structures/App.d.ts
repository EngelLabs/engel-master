import * as models from '../models';
import * as utils from '../utils/helpers';
import type * as eris from 'eris';
import type * as mongoose from 'mongoose';
import type * as ioredis from 'ioredis';
import type * as winston from 'winston';
import type * as types from '@engel/types';
import { EventEmitter } from 'eventemitter3';
import Eris from '../clients/Eris';
import Mongoose from '../clients/Mongoose';
import Redis from '../clients/Redis';
export default class App extends EventEmitter {
    baseConfig: {
        name: string;
        version: string;
        lib: string;
        env: string;
        dev: boolean;
        logger: {
            level: string;
            dir: string;
        };
        client: {
            state: string;
            premium: boolean;
            id: string;
            token: string;
            secret: string;
        };
        mongo: {
            host: string;
            port: string;
            db: string;
        };
        redis: {
            host: string;
            port: number;
        };
    };
    models: typeof models;
    utils: typeof utils;
    eris: eris.Client;
    logger: winston.Logger;
    mongoose: mongoose.Mongoose;
    redis: ioredis.Redis;
    erisClient: typeof Eris;
    redisClient: typeof Redis;
    mongooseClient: typeof Mongoose;
    setup?(): Promise<void>;
    private _config;
    private _configInterval;
    constructor();
    static get instance(): App;
    log(message?: any, level?: types.LogLevels, ...sources: string[]): void;
    get config(): types.Config;
    set config(config: types.Config);
    getConfig(): Promise<types.Config>;
    configure(): Promise<void>;
    start(): Promise<void>;
    on<T = 'config'>(event: T, fn: (config: types.Config) => any): this;
}
