"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@engel/core");
class GuildCollection extends Map {
    _core;
    _uncacheInterval;
    _creating = {};
    constructor(core) {
        super();
        this._core = core;
        const subredis = (0, core_1.Redis)(core, false);
        subredis.subscribe('guildUpdate');
        subredis.on('message', this.guildUpdate.bind(this));
        core.eris.on('guildCreate', this.guildCreate.bind(this));
        core.eris.on('guildDelete', this.guildDelete.bind(this));
        core.on('config', this._configure.bind(this));
    }
    _configure(config) {
        if (config.guildCache && config.guildUncacheInterval !== this._core.config.guildUncacheInterval) {
            clearInterval(this._uncacheInterval);
            this._uncacheInterval = setInterval(this.uncache.bind(this), config.guildUncacheInterval);
        }
    }
    uncache() {
        const now = Date.now();
        for (const guild of this.values()) {
            if (now - guild._cachedAt > this._core.config.guildMaxAge) {
                this.delete(guild.id);
            }
        }
    }
    guildCreate({ id }) {
        this.fetch(id)
            .then(guild => !guild && this.create(id));
    }
    guildDelete({ id }) {
        this.delete(id);
    }
    guildUpdate(chnl, id) {
        if (chnl !== 'guildUpdate')
            return;
        if (this._core.eris.guilds.has(id)) {
            this.fetch(id);
        }
    }
    getOrFetch(id, options) {
        const guildID = typeof id === 'string' ? id : id.id;
        return new Promise((resolve, reject) => {
            if (this._core.config.guildCache) {
                const ret = this.get(guildID);
                if (ret) {
                    return resolve(ret);
                }
            }
            this.fetch(guildID, options)
                .then(resolve)
                .catch(reject);
        });
    }
    fetch(id, options) {
        const guildID = typeof id === 'string' ? id : id.id;
        return new Promise((resolve, reject) => {
            this._core.models.Guild.findOne({ id: guildID })
                .lean()
                .exec()
                .then((guild) => {
                if (guild && this._core.config.guildCache) {
                    this.set(guildID, guild);
                }
                if (!guild && options?.createIfNotFound) {
                    return this.create(guildID)
                        .then(resolve)
                        .catch(reject);
                }
                resolve(guild);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    create(id) {
        const guildID = typeof id === 'string' ? id : id.id;
        if (this._creating[guildID]) {
            return this._creating[guildID];
        }
        const doc = {
            id: guildID,
            prefixes: this._core.config.prefixes.default,
            client: this._core.baseConfig.client.name
        };
        const p = new Promise((resolve, reject) => {
            this._core.models.Guild.create(doc)
                .then((guild) => {
                if (this._core.config.guildCache) {
                    this.set(guildID, guild);
                }
                resolve(guild);
            })
                .catch(err => {
                reject(err);
            })
                .finally(() => {
                if (this._creating[guildID]) {
                    delete this._creating[guildID];
                }
            });
        });
        this._creating[guildID] = p;
        return p;
    }
    update(id, update) {
        const guildID = typeof id === 'string' ? id : id.id;
        return new Promise((resolve, reject) => {
            this._core.models.Guild.updateOne({ id: guildID }, update)
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
exports.default = GuildCollection;
//# sourceMappingURL=GuildCollection.js.map