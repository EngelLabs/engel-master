import * as core from '@engel/core';
import type * as types from '@engel/types';
import Eris from './clients/Eris';
import baseConfig from './utils/baseConfig';
import StateManager from './managers/StateManager';
import EventManager from './managers/EventManager';
import IPCManager from './managers/IPCManager';
import CommandCollection from './collections/CommandCollection';
import GuildCollection from './collections/GuildCollection';
import ModuleCollection from './collections/ModuleCollection';

/**
 * Represents a Discord bot
 */
export default class Core extends core.Core {
        public erisClient = Eris;
        public baseConfig = baseConfig;
        public events: EventManager;
        public state: StateManager;
        public ipc: IPCManager;
        public guilds: GuildCollection;
        public commands: CommandCollection;
        public modules: ModuleCollection;

        public log(message?: any, level: types.LogLevels = 'debug', prefix?: string): void {
                if (!message) {
                        return;
                }

                try {
                        message = `[${baseConfig.client.name.toUpperCase()}-C${baseConfig.cluster.id}] [${prefix || this.constructor.name}] ${message}`;
                } catch { }

                this.logger.log({ message, level });
        }

        /**
         * Set the bot instance up
         */
        public async setup(): Promise<void> {
                this.events = new EventManager(this);
                this.state = new StateManager(this);
                this.ipc = new IPCManager(this);

                this.guilds = new GuildCollection(this);
                this.commands = new CommandCollection(this);
                this.modules = new ModuleCollection(this);

                await this.modules.load();

                if (baseConfig.dev) {
                        this.modules.register();
                        this.commands.register();
                }

                await this.eris.connect();

                const connectedShards = new Set();

                const connectListener = (id: number) => {
                        connectedShards.add(id);

                        if (connectedShards.size === (baseConfig.cluster.lastShard - baseConfig.cluster.firstShard + 1)) {
                                this.eris.off('connect', connectListener);
                                setTimeout(() => this.ipc.send('ready'), 5000);
                        }
                };

                this.eris.on('connect', connectListener);
        }
}
