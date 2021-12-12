const Guild = require('../models/Guild');
const logger = require('../core/logger');


class GuildCollection extends Map {
    constructor(bot, options = { cache: true }) {
        super();

        this.bot = bot;
        this.cache = options.cache;
        this.creating = {};

        if (options.cache) {
            setInterval(this.uncache.bind(this), 60000);

            bot.redis.subscribe('guildUpdate');
            bot.redis.on('message', (channel, message) => {
                if (channel === 'guildUpdate') this.guildUpdate(message)
            });
            bot.eris.on('guildCreate', this.guildCreate.bind(this));
            bot.eris.on('guildDelete', this.guildDelete.bind(this));
        }
    }

    uncache() {
        const now = Date.now();

        for (const [id, guild] of this.entries()) {
            if (now - guild._cachedAt > 5000) {
                this.delete(id);
            }
        }
    }

    guildCreate({ id }) {
        this.fetch(id)
            .then(guild => {
                if (!guild) this.create(id);
            });
    }

    guildDelete({ id }) {
        this.delete(id);
    }

    guildUpdate(id) {
        if (this.bot.eris.guilds.has(id)) {
            this.fetch(id);
        }
    }

    getOrFetch(id) {
        return new Promise((resolve, reject) => {
            if (this.cache) {
                const ret = this.get(id);

                if (ret) return resolve(ret);
            }

            this.fetch(id)
                .then(resolve)
                .catch(reject);
        });
    }

    fetch(id) {
        return new Promise((resolve, reject) => {
            Guild.findOne({ id })
                .lean()
                .exec()
                .then(guild => {
                    if (guild && this.cache) {
                        this.set(id, guild);
                    }

                    resolve(guild);
                })
                .catch(err => {
                    logger.error(err);

                    reject(err);
                });
        });
    }

    create(id) {
        if (this.creating[id]) {
            return this.creating[id];
        }

        const doc = {
            id: id,
            prefixes: this.bot.config.prefixes.default,
        };

        const p = new Promise((resolve, reject) => {
            Guild.create(doc)
                .then(guild => {
                    if (this.cache) {
                        this.set(id, guild);
                    }

                    if (this.creating[id]) {
                        delete this.creating[id];
                    }

                    resolve(guild);
                })
                .catch(err => {
                    logger.error(err);

                    if (this.creating[id]) {
                        delete this.creating[id];
                    }

                    reject(err);
                });
        });

        this.creating[id] = p;

        return p;
    }

    update(id, update) {
        return new Promise((resolve, reject) => {
            Guild.updateOne({ id: id.id || id }, update)
                .exec()
                .then(resolve)
                .catch(reject);
        });
    }

    set(key, value) {
        value._cachedAt = Date.now();

        return super.set(key, value);
    }
}


module.exports = GuildCollection;