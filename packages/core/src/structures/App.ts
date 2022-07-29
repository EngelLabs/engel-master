import * as utils from '../utils/helpers';
import type * as eris from 'eris';
import type * as ioredis from 'ioredis';
import type * as types from '@engel/types';
import { EventEmitter } from 'eventemitter3';
import createLogger from '../utils/createLogger';
import Eris from '../clients/Eris';
import MongoDB from '../clients/MongoDB';
import Redis from '../clients/Redis';
import type { Logger } from '../types';
import createStaticConfig from '../utils/createStaticConfig';

global.Promise = require('bluebird');

export default class App extends EventEmitter {
        public staticConfig: types.StaticConfig;
        public utils = utils;
        public eris: eris.Client;
        public logger: Logger;
        public mongo: MongoDB;
        public redis: ioredis.Redis;
        public Eris = Eris;
        public Redis = Redis;
        public MongoDB = MongoDB;
        public setup?(): Promise<void>;
        private _config: types.Config;
        private _configInterval: NodeJS.Timer;

        public get config(): types.Config {
                return this._config;
        }

        public set config(config) {
                if (!config) {
                        this.logger.error(`Configuration not found for state ${this.staticConfig.client.state}`);

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
                return this.mongo.configurations.findOne({ state: this.staticConfig.client.state });
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
                        /* Subclasses can implement their own staticConfig */
                        if (!this.staticConfig) {
                                this.staticConfig = createStaticConfig();
                        }
                        const { staticConfig } = this;
                        this.logger = createLogger(this);

                        this.logger.debug(`Starting ${staticConfig.name}(env=${staticConfig.env} s=${staticConfig.client.state}, v=${staticConfig.version}).`);

                        this.eris = new this.Eris(this);
                        this.mongo = new this.MongoDB(this);
                        this.redis = new this.Redis(this);

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
