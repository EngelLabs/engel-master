import type * as mongodb from 'mongodb';
import type * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import type Core from '../Core';

interface FetchOptions {
        createIfNotFound?: boolean;
}

export default class GuildCollection extends Map<string, types.Guild> {
        private _core: Core;
        private _uncacheInterval?: NodeJS.Timer;
        private _creating: Record<string, Promise<types.Guild>> = {};

        public constructor(core: Core) {
                super();

                this._core = core;

                core.redis.subscribe('guildUpdate');
                core.redis.on('message', this.guildUpdate.bind(this));
                core.eris.on('guildCreate', this.guildCreate.bind(this));
                core.eris.on('guildDelete', this.guildDelete.bind(this));

                core.on('config', this._configure.bind(this));
        }

        private _configure(config: types.Config): void {
                if (config.guildCache && config.guildUncacheInterval !== this._core.config.guildUncacheInterval) {
                        clearInterval(this._uncacheInterval);

                        this._uncacheInterval = setInterval(this.uncache.bind(this), config.guildUncacheInterval);
                }
        }

        public uncache(): void {
                const now = Date.now();

                for (const guild of this.values()) {
                        if (now - guild._cachedAt > this._core.config.guildMaxAge) {
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

                if (this._core.eris.guilds.has(id)) {
                        this.fetch(id);
                }
        }

        public getOrFetch(id: string | { id: string }, options?: FetchOptions): Promise<types.Guild | undefined> {
                const guildID: string = typeof id === 'string' ? id : id.id;

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

        public fetch(id: string | { id: string }, options?: FetchOptions): Promise<types.Guild | undefined> {
                const guildID: string = typeof id === 'string' ? id : id.id;

                return new Promise((resolve, reject) => {
                        this._core.models.Guild.findOne({ id: guildID })
                                .lean()
                                .exec()
                                .then((guild: types.Guild | undefined) => {
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

        public create(id: string | { id: string }) {
                const guildID: string = typeof id === 'string' ? id : id.id;

                if (this._creating[guildID]) {
                        return this._creating[guildID];
                }

                const doc: types.Guild = {
                        id: guildID,
                        prefixes: this._core.config.prefixes.default,
                        client: this._core.baseConfig.client.name
                };

                const p: Promise<types.Guild> = new Promise((resolve, reject) => {
                        this._core.models.Guild.create(doc)
                                .then((guild: types.Guild) => {
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

        public update(id: string | { id: string }, update: mongoose.UpdateQuery<types.Guild>): Promise<mongodb.UpdateResult> {
                const guildID: string = typeof id === 'string' ? id : id.id;

                return new Promise((resolve, reject) => {
                        this._core.models.Guild.updateOne({ id: guildID }, update)
                                .exec()
                                .then(resolve)
                                .catch(reject);
                });
        }

        public set(key: string, value: types.Guild): this {
                value._cachedAt = value._cachedAt || Date.now();

                return super.set(key, value);
        }
}
