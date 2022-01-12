const logger = require('../utils/logger');


class GuildCollection extends Map {
    constructor(bot) {
        super();

        this.bot = bot;
        this._creating = {};

        if (bot.config.guildCache) {
            setInterval(this.uncache.bind(this), bot.config.guildUncacheInterval);

            bot.redis.subscribe('guildUpdate');
            bot.redis.on('message', (chnl, msg) => chnl === 'guildUpdate' && this.guildUpdate(msg));
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

    getOrFetch(id, options) {
        id = id.id || id;

        return new Promise((resolve, reject) => {
            if (this.cache) {
                const ret = this.get(id);

                if (ret) return resolve(ret);
            }

            this.fetch(id, options)
                .then(resolve)
                .catch(reject);
        });
    }

    fetch(id, options) {
        id = id.id || id;

        return new Promise((resolve, reject) => {
            this.bot.models.Guild.findOne({ id })
                .lean()
                .exec()
                .then(guild => {
                    if (guild && this.cache) {
                        this.set(id, guild);
                    }

                    if (!guild && options && options.createIfNotFound) {
                        return this.create(id)
                            .then(resolve)
                            .catch(reject);
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
        id = id.id || id;

        if (this._creating[id]) {
            return this._creating[id];
        }

        const doc = {
            id: id,
            prefixes: this.bot.config.prefixes.default,
        };

        const p = new Promise((resolve, reject) => {
            this.bot.models.Guild.create(doc)
                .then(guild => {
                    if (this.cache) {
                        this.set(id, guild);
                    }

                    resolve(guild);
                })
                .catch(err => {
                    logger.error(err);

                    reject(err);
                })
                .finally(() => {
                    if (this._creating[id]) {
                        delete this._creating[id];
                    }
                });
        });

        this._creating[id] = p;

        return p;
    }

    update(id, update) {
        return new Promise((resolve, reject) => {
            this.bot.models.Guild.updateOne({ id: id.id || id }, update)
                .exec()
                .then(resolve)
                .catch(reject);
        });
    }

    set(key, value) {
        value._cachedAt = value._cachedAt || Date.now();

        return super.set(key, value);
    }
}


module.exports = GuildCollection;