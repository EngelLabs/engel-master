'use strict';

const Eris = require('eris');
const logger = require('./logger');
const redis = require('./redis');
const baseConfig = require('./baseConfig');
const database = require('../models');
const Config = require('../models/Config');
const CommandCollection = require('../collections/CommandCollection');
const ModuleCollection = require('../collections/ModuleCollection');
const GuildCollection = require('../collections/GuildCollection');

let EventEmitter;

try {
    EventEmitter = require('eventemitter3').EventEmitter;
} catch {
    EventEmitter = require('events').EventEmitter;
}


class Bot extends EventEmitter {
    constructor() {
        super();

        Bot.instance = this;
    }

    get logger() {
        return logger;
    }

    get baseConfig() {
        return baseConfig;
    }

    get database() {
        return database;
    }

    get redis() {
        return redis;
    }

    get config() {
        return this._config;
    }

    set config(config) {
        if (!config) throw new Error(`Configuration not found for state ${baseConfig.state}`);

        return (this._config = config);
    }

    updateConfig() {
        return this.getConfig()
            .then(config => this.config = config)
            .catch(err => {
                logger.error(err)
                return Promise.reject(err)
            });
    }

    getConfig() {
        return new Promise((resolve, reject) => {
            Config.findOne({
                state: baseConfig.state
            })
                .lean()
                .exec()
                .then(resolve)
                .catch(reject)
        });
    }

    async run(options) {
        try {
            logger.info(`[Bot] Starting ${baseConfig.name} (${baseConfig.state}, v${baseConfig.version}).`);

            options = Object.assign(options || {}, baseConfig.defaultOptions);

            this.config = await this.getConfig();

            if (!this.config.dev) {
                process.on('unhandledRejection', (reason, promise) => {
                    logger.error(`Unhandled Promise rejection at promise ${promise}. Reason: ${reason}`);
                });
            }

            const eris = this.eris = new Eris(baseConfig.token, options.eris);

            const me = await eris.getSelf();

            if (baseConfig.clientId !== me.id) {
                throw new Error(`Invalid clientId ${baseConfig.clientId} provided. Actual user ID: ${me.id}`);
            }

            this.commands = new CommandCollection(this);
            this.modules = new ModuleCollection(this);
            this.guilds = new GuildCollection(this, { cache: !options.disableCache });

            setInterval(this.updateConfig.bind(this), 25000);

            this.modules.load();

            await this.modules.register(this.config);
            await this.commands.register(this.config);

            eris
                .on('connect', () => {
                    logger.info('[Eris] Connected.');
                })
                .on('disconnect', () => {
                    logger.info('[Eris] Disconnected.');
                    this.ready = false;
                })
                .on('ready', () => {
                    logger.info('[Eris] Ready.');
                    this.ready = true;
                })
                .on('error', err => {
                    logger.error('[Eris] Something went wrong.');
                    console.error(err);
                })
                .on('warn', msg => {
                    logger.warn(`[Eris] ${msg}`)
                });

            await eris.connect();

        } catch (err) {
            logger.error(`[Bot] Something went wrong.`);
            console.error(err);

            process.send && process.send({ op: 'close' });

            process.exit(1);
        }
    }
}

module.exports = Bot;