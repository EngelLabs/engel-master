import * as EventEmitter from 'eventemitter3';
import type * as core from '@engel/core';
import App from '../structures/App';

export default class IPCManager extends EventEmitter<string> {
        private _app: App;
        private _redis: core.Redis;
        private _redisChannels: string[] = [];

        public constructor(app: App) {
                super();

                this._app = app;
                this._redis = app.redis;

                this._redis.sub.on('message', (chnl: string, data: string) => {
                        if (!this._redisChannels.includes(chnl)) {
                                return;
                        }

                        const parsed = JSON.parse(data);

                        // Message was sent by an IPCManager instance
                        if (typeof parsed.cluster === 'number') {
                                // Ignore our own messages
                                if (parsed.cluster === app.staticConfig.cluster.id) {
                                        return;
                                }
                                this.emit(chnl, parsed.data);
                        } else {
                                // Message was not sent by an IPCManager
                                this.emit(chnl, parsed);
                        }
                });
        }

        public on(event: string, fn: (...args: any[]) => void): this {
                return super.on(this._prefixChannel(event), fn);
        }

        public once(event: string, fn: (...args: any[]) => void): this {
                return super.once(this._prefixChannel(event), fn);
        }

        public addListener = this.on;

        public subscribe(...channels: string[]): Promise<number> {
                channels = channels.map(c => this._prefixChannel(c));
                return this._redis.sub.subscribe(...channels).then(n => {
                        this._redisChannels.push(...channels);
                        return n;
                });
        }

        public unsubscribe(...channels: string[]): Promise<number> {
                channels = channels.map(c => this._prefixChannel(c));
                return this._redis.sub.unsubscribe(...channels).then(n => {
                        this._redisChannels = this._redisChannels.filter(c => !channels.includes(c));
                        return n;
                });
        }

        public publish(channel: string, message: any): Promise<number> {
                const { staticConfig } = this._app;
                const data = JSON.stringify({ cluster: staticConfig.cluster.id, data: message });

                channel = this._prefixChannel(channel);

                return this._redis.publish(channel, data);
        }

        private _prefixChannel(channel: string): string {
                const prefix = `engel:${this._app.staticConfig.client.state}:`;
                if (!channel.startsWith(prefix)) {
                        channel = prefix + channel;
                }
                return channel;
        }
}
