const logger = require('./utils/logger');
const baseConfig = require('./utils/baseConfig');
const Eris = require('./clients/Eris');
const Redis = require('./clients/Redis');
const Mongoose = require('./clients/Mongoose');
const CommandCollection = require('./collections/CommandCollection');
const ModuleCollection = require('./collections/ModuleCollection');
const GuildCollection = require('./collections/GuildCollection');
const CacheManager = require('./managers/CacheManager');
const EventManager = require('./managers/EventManager');

let EventEmitter;

try {
        EventEmitter = require('eventemitter3');
} catch {
        EventEmitter = require('events');
}


/**
 * Represents a Discord bot
 * @class Bot
 */
class Bot extends EventEmitter {
        constructor() {
                Bot.instance = this;
        }

        /**
         * Logger instance
         */
        get logger() {
                return logger;
        }

        /**
         * Mongoose models
         */
        get models() {
                return this.mongoose.models;
        }

        /**
         * Base configuration object
         * @type {Object}
         */
        get baseConfig() {
                return baseConfig;
        }

        /**
         * The program state
         * @type {String}
         */
        get state() {
                return baseConfig.client.state;
        }

        /**
         * Whether the service is ready
         */
        get isReady() {
                return (
                        this._erisIsReady &&
                        this._mongoIsReady &&
                        this._redisIsReady
                );
        }

        /**
         * Fetch configuration
         * @returns {Promise<Object|any>}
        */
        getConfig() {
                return this.models.Config
                        .findOne({ state: this.state })
                        .lean()
                        .exec()
                        .then(config => {
                                if (!config) {
                                        logger.error(`Configuration not found for state ${this.state}`);

                                        process.send && process.send({ op: 'config', d: this.state });
                                        process.exit(1);
                                }

                                this.emit('config', config);

                                return config;
                        });
        }

        async updateConfig() {
                try {
                        await this.getConfig().then(c => this.config = c)
                } catch (err) {
                        logger.error('[Bot] Something went wrong.');
                        console.error(err);
                }
        }

        async configure() {
                this.config = await this.getConfig();

                setInterval(this.updateConfig.bind(this), this.config.configRefreshInterval);

                this._ready = true;
        }

        /**
         * Start the bot
         */
        async start() {
                try {
                        logger.info(`[Bot] Starting ${baseConfig.name} (env=${baseConfig.env} s=${this.state}, v=${baseConfig.version}).`);

                        this.eris = new Eris(this);
                        this.redis = new Redis(this);
                        this.mongoose = new Mongoose(this);

                        this.events = new EventManager(this);
                        this.cache = new CacheManager(this);

                        this.guilds = new GuildCollection(this);
                        this.commands = new CommandCollection(this);
                        this.modules = new ModuleCollection(this);

                        await this.configure();

                        this.modules.load();

                        if (baseConfig.dev) {
                                this.modules.register();
                                this.commands.register();
                        }

                        await this.eris.connect();

                } catch (err) {
                        logger.error(`[Bot] Something went wrong.`);
                        console.error(err);

                        process.send && process.send('close');
                        process.exit(1);
                }
        }
}


module.exports = Bot;