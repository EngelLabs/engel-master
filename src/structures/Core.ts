import * as eris from 'eris';
import * as mongoose from 'mongoose';
import * as ioredis from 'ioredis';
import * as winston from 'winston';
import * as types from '../types';
import * as models from '../models';
import { EventEmitter } from 'eventemitter3';
import baseConfig from '../utils/baseConfig';
import Eris from '../clients/Eris';
import Logger from '../clients/Logger';
import Mongoose from '../clients/Mongoose';
import Redis from '../clients/Redis';

let coreInstance: Core;

global.Promise = require('bluebird');

export default class Core extends EventEmitter {
        public baseConfig = baseConfig;
        public models = models;
        public eris: eris.Client;
        public logger: winston.Logger;
        public mongoose: mongoose.Mongoose;
        public redis: ioredis.Redis;
        public setup?(): Promise<void>;
        private _config: types.Config;
        private _configInterval: NodeJS.Timer;

        public constructor() {
                super();

                coreInstance = this;
        }

        public static get instance(): Core {
                return coreInstance;
        }

        public log(message?: any, level: types.LogLevels = 'debug', prefix?: string): void {
                if (!message) {
                        return;
                }

                prefix = prefix || this.constructor.name;

                if (level === 'error') {
                        this.logger.error(`[${prefix}] Something went wrong`);

                        console.error(message);
                } else {
                        this.logger[level](`[${prefix}] ${message}`);
                }
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
                        this.log(err, 'error');
                }
        }

        public async start(): Promise<void> {
                try {
                        this.logger = Logger(this);

                        this.log(`Starting ${baseConfig.name}[${baseConfig.client.name}] (env=${baseConfig.env} s=${baseConfig.client.state}, v=${baseConfig.version}).`, 'info');

                        this.eris = Eris(this);
                        this.mongoose = Mongoose(this);
                        this.redis = Redis(this);

                        await this.configure();

                        if (typeof this.setup === 'function') {
                                await this.setup();
                        }

                        await this.eris.connect();
                } catch (err) {
                        try {
                                this.log(err, 'error');
                        } catch {
                                console.log(err)
                        }

                        process.exit(1);
                }
        }
}
