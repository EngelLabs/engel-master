import * as models from '../models';
import * as utils from '../utils/helpers';
import type * as eris from 'eris';
import type * as mongoose from 'mongoose';
import type * as ioredis from 'ioredis';
import type * as types from '@engel/types';
import { EventEmitter } from 'eventemitter3';
import baseConfig from '../utils/baseConfig';
import createLogger from '../utils/createLogger';
import Eris from '../clients/Eris';
import Mongoose from '../clients/Mongoose';
import Redis from '../clients/Redis';
import type { Logger } from '../types';

/* eslint-disable-next-line no-use-before-define */
let appInstance: App;

global.Promise = require('bluebird');

export default class App extends EventEmitter {
        public baseConfig = baseConfig;
        public models = models;
        public utils = utils;
        public eris: eris.Client;
        public logger: Logger;
        public mongoose: mongoose.Mongoose;
        public redis: ioredis.Redis;
        public erisClient = Eris;
        public redisClient = Redis;
        public mongooseClient = Mongoose;
        public setup?(): Promise<void>;
        private _config: types.Config;
        private _configInterval: NodeJS.Timer;

        public constructor() {
                super();

                appInstance = this;
        }

        public static get instance(): App {
                return appInstance;
        }

        public get config(): types.Config {
                return this._config;
        }

        public set config(config) {
                if (!config) {
                        this.logger.error(`Configuration not found for state ${baseConfig.client.state}`);

                        process.exit(1);
                }

                this.emit('config', config);

                if (config.configRefreshInterval !== this._config?.configRefreshInterval) {
                        clearInterval(this._configInterval);

                        this._configInterval = setInterval(this.configure.bind(this), config.configRefreshInterval);
                }

                this._config = config;
        }

        public getConfig(): Promise<types.Config> {
                return this.models.Config
                        .findOne({ state: baseConfig.client.state })
                        .lean()
                        .exec();
        }

        public async configure(): Promise<void> {
                try {
                        this.config = await this.getConfig();
                } catch (err) {
                        this.logger.error(err);
                }
        }

        public async start(): Promise<void> {
                try {
                        this.logger = createLogger(this);

                        this.logger.debug(`Starting ${baseConfig.name}(env=${baseConfig.env} s=${baseConfig.client.state}, v=${baseConfig.version}).`);

                        this.eris = this.erisClient(this);
                        this.mongoose = this.mongooseClient(this);
                        this.redis = this.redisClient(this);

                        await this.configure();

                        if (typeof this.setup === 'function') {
                                await this.setup();
                        }
                } catch (err) {
                        try {
                                this.logger.error(err);
                        } catch {
                                console.log(err);
                        }

                        process.exit(1);
                }
        }

        public on<T = 'config'>(event: T, fn: (config: types.Config) => any): this;
        public on<T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any): this {
                return super.on(event, fn, context);
        }
}
