import * as mongodb from 'mongodb';
import * as mongoose from 'mongoose';
import { types } from '@engel/core';
import Bot from '../Bot';


interface FetchOptions {
        createIfNotFound?: boolean;
}


export default class GuildCollection extends Map<string, types.GuildConfig> {
        private _bot: Bot;
        private _uncacheInterval?: NodeJS.Timer;
        private _creating: Record<string, Promise<types.GuildConfig>> = {};

        public constructor(bot: Bot) {
                super();

                this._bot = bot;

                bot.redis.subscribe('guildUpdate');
                bot.redis.on('message', this.guildUpdate.bind(this));
                bot.eris.on('guildCreate', this.guildCreate.bind(this));
                bot.eris.on('guildDelete', this.guildDelete.bind(this));

                bot.on('config', this._configure.bind(this));
        }

        private _configure(config: types.Config): void {
                if (config.guildCache && config.guildUncacheInterval !== this._bot.config.guildUncacheInterval) {
                        clearInterval(this._uncacheInterval);

                        this._uncacheInterval = setInterval(this.uncache.bind(this), config.guildUncacheInterval);
                }
        }

        public uncache(): void {
                const now = Date.now();

                for (const guild of this.values()) {
                        if (now - guild._cachedAt > this._bot.config.guildMaxAge) {
                                this.delete(guild.id);
                        }
                }
        }

        private guildCreate({ id }: { id: string }): void {
                this.fetch(id)
                        .then(guild => !guild && this.create(id));
        }

        private guildDelete({ id }: { id: string }): void {
                this.delete(id);
        }

        private guildUpdate(chnl: string, id: string): void {
                if (chnl !== 'guildUpdate') return;

                if (this._bot.eris.guilds.has(id)) {
                        this.fetch(id);
                }
        }

        public getOrFetch(id: string | { id: string }, options?: FetchOptions): Promise<types.GuildConfig | undefined> {
                const guildID: string = typeof id === 'string' ? id : id.id;

                return new Promise((resolve, reject) => {
                        if (this._bot.config.guildCache) {
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

        public fetch(id: string | { id: string }, options?: FetchOptions): Promise<types.GuildConfig | undefined> {
                const guildID: string = typeof id === 'string' ? id : id.id;

                return new Promise((resolve, reject) => {
                        this._bot.models.Guild.findOne({ id: guildID })
                                .lean()
                                .exec()
                                .then((guild: types.GuildConfig | undefined) => {
                                        if (guild && this._bot.config.guildCache) {
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

        public create(id: string | { id: string }) {
                const guildID: string = typeof id === 'string' ? id : id.id;

                if (this._creating[guildID]) {
                        return this._creating[guildID];
                }

                const doc: types.GuildConfig = {
                        id: guildID,
                        prefixes: this._bot.config.prefixes.default,
                        client: this._bot.baseConfig.client.name,
                };

                const p: Promise<types.GuildConfig> = new Promise((resolve, reject) => {
                        this._bot.models.Guild.create(doc)
                                .then((guild: types.GuildConfig) => {
                                        if (this._bot.config.guildCache) {
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

        public update(id: string | { id: string }, update: mongoose.UpdateQuery<types.GuildConfig>): Promise<mongodb.UpdateResult> {
                const guildID: string = typeof id === 'string' ? id : id.id;

                return new Promise((resolve, reject) => {
                        this._bot.models.Guild.updateOne({ id: guildID }, update)
                                .exec()
                                .then(resolve)
                                .catch(reject);
                });
        }

        public set(key: string, value: types.GuildConfig): this {
                value._cachedAt = value._cachedAt || Date.now();

                return super.set(key, value);
        }
}
