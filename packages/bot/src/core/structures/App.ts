import * as jayson from 'jayson/promise';
import * as core from '@engel/core';
import Eris from '../clients/Eris';
import baseConfig from '../utils/baseConfig';
import StateManager from '../managers/StateManager';
import EventManager from '../managers/EventManager';
import CommandCollection from '../collections/CommandCollection';
import GuildCollection from '../collections/GuildCollection';
import ModuleCollection from '../collections/ModuleCollection';

/**
 * Represents a Discord bot
 */
export default class App extends core.App {
        public Eris = Eris;
        public baseConfig = baseConfig;
        public events: EventManager;
        public state: StateManager;
        public guilds: GuildCollection;
        public commands: CommandCollection;
        public modules: ModuleCollection;
        public rpc: jayson.HttpClient;

        /**
         * Set the bot instance up
         */
        public async setup(): Promise<void> {
                this.rpc = jayson.client.http({ port: baseConfig.cluster.manager.port });

                this.events = new EventManager(this);
                this.state = new StateManager(this);

                this.guilds = new GuildCollection(this);
                this.commands = new CommandCollection(this);
                this.modules = new ModuleCollection(this);

                await this.modules.load();

                if (baseConfig.dev) {
                        this.modules.register();
                        this.commands.register();
                }

                // Signal to cluster manager that we are
                // waiting to connect our shards
                process.send('hello');
                process.on('message', message => {
                        if (message === 'connect') {
                                this.connect().catch(err => this.logger.error(err));
                        }
                });
        }

        private async connect() {
                await this.eris.connect();

                const connectedShards = new Set();

                const connectListener = (id: number) => {
                        connectedShards.add(id);

                        if (connectedShards.size === (baseConfig.cluster.lastShard - baseConfig.cluster.firstShard + 1)) {
                                this.eris.off('connect', connectListener);

                                setTimeout(() => process.send('ready'), 5000);
                        }
                };

                this.eris.on('connect', connectListener);
        }
}
