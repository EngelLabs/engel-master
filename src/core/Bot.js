const logger = require('./utils/logger');
const baseConfig = require('./baseConfig');
const Eris = require('./clients/Eris');
const Redis = require('./clients/Redis');
const Mongoose = require('./clients/Mongoose');
const CommandCollection = require('./collections/CommandCollection');
const ModuleCollection = require('./collections/ModuleCollection');
const GuildCollection = require('./collections/GuildCollection');
const CacheManager = require('./managers/CacheManager');
const EventManager = require('./managers/EventManager');
const Permission = require('./helpers/Permission');
const Moderator = require('./helpers/Moderator');
const Converter = require('./helpers/Converter');


let _instance = null;


/**
 * Represents a Discord bot
 * @class Bot
 */
class Bot {
    constructor() {
        _instance = this;
    }

    static get instance() {
        return _instance;
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
            this._ready &&
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

    setup() {
        this.eris = new Eris(this);
        this.redis = new Redis(this);
        this.mongoose = new Mongoose(this);

        this.events = new EventManager(this);
        this.cache = new CacheManager(this);

        this.helpers = {
            converter: new Converter(this),
            moderation: new Moderator(this),
            permissions: new Permission(this),
        }

        this.guilds = new GuildCollection(this);
        this.commands = new CommandCollection(this);
        this.modules = new ModuleCollection(this);

        this.modules.load();
    }

    /**
     * Start the bot
     */
    async start() {
        try {
            this.setup();

            await this.getConfig().then(c => this.config = c);

            this.guilds.setup();

            setInterval(
                this.updateConfig.bind(this),
                this.config.configRefreshInterval
            );

            if (baseConfig.dev) {
                Promise.all([this.modules.register(), this.commands.register()])
                    .then(() => this._ready = true);
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