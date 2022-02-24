import * as core from '@engel/core';
import baseConfig from './utils/baseConfig';
import StateManager from './managers/StateManager';
import EventManager from './managers/EventManager';
import CommandCollection from './collections/CommandCollection';
import GuildCollection from './collections/GuildCollection';
import ModuleCollection from './collections/ModuleCollection';


/**
 * Represents a Discord core
 */
export default class Core extends core.Core {
        public baseConfig = baseConfig;
        public events: EventManager;
        public state: StateManager;
        public guilds: GuildCollection;
        public commands: CommandCollection;
        public modules: ModuleCollection;

        /**
         * Set the core instance up
         */
        public setup(): Promise<void> {

                this.events = new EventManager(this);
                this.state = new StateManager(this);

                this.guilds = new GuildCollection(this);
                this.commands = new CommandCollection(this);
                this.modules = new ModuleCollection(this);

                this.modules.load();

                if (baseConfig.dev) {
                        this.modules.register();
                        this.commands.register();
                }

                return Promise.resolve();
        }
}