'use strict';

const Eris = require('eris');
const logger = require('./logger');
const redis = require('./redis');
const baseConfig = require('./baseConfig');
const mongoose = require('../models');
const CommandCollection = require('../collections/CommandCollection');
const ModuleCollection = require('../collections/ModuleCollection');
const GuildCollection = require('../collections/GuildCollection');

let EventEmitter;

try {
    EventEmitter = require('eventemitter3');
} catch {
    EventEmitter = require('events');
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

    get mongoose() {
        return mongoose;
    }

    get models() {
        return mongoose.models;
    }

    get redis() {
        return redis;
    }

    updateConfig() {
        return this.getConfig()
            .then(config => {
                if (!config) {
                    logger.error(`Configuration not found for state ${baseConfig.state}`);

                    return;
                }

                return this.config = config;
            })
            .catch(err => {
                logger.error(err);

                return Promise.reject(err);
            });
    }

    getConfig() {
        return new Promise((resolve, reject) => {
            this.models.Config.findOne({ state: baseConfig.state })
                .lean()
                .exec()
                .then(resolve)
                .catch(reject);
        });
    }

    async run(options) {
        try {
            logger.info(`[Bot] Starting ${baseConfig.name} (${baseConfig.state}, v${baseConfig.version}).`);

            options = Object.assign(options || {}, baseConfig.defaultOptions);

            const config = this.config = await this.getConfig();

            if (!config.dev) {
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

            setInterval(this.updateConfig.bind(this), config.updateInterval);

            this.modules.load();

            if (config.dev) {
                this.commands.register(config);
                this.modules.register(config);
            }

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