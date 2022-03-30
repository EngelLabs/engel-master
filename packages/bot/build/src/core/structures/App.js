"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
const Eris_1 = require("../clients/Eris");
const baseConfig_1 = require("../utils/baseConfig");
const StateManager_1 = require("../managers/StateManager");
const EventManager_1 = require("../managers/EventManager");
const IPCManager_1 = require("../managers/IPCManager");
const CommandCollection_1 = require("../collections/CommandCollection");
const GuildCollection_1 = require("../collections/GuildCollection");
const ModuleCollection_1 = require("../collections/ModuleCollection");
class App extends core.App {
    erisClient = Eris_1.default;
    baseConfig = baseConfig_1.default;
    events;
    state;
    ipc;
    guilds;
    commands;
    modules;
    log(message, level = 'debug', ...sources) {
        super.log(message, level, `${baseConfig_1.default.client.name.toUpperCase()}-C${baseConfig_1.default.cluster.id}`, ...sources);
    }
    async setup() {
        this.events = new EventManager_1.default(this);
        this.state = new StateManager_1.default(this);
        this.ipc = new IPCManager_1.default(this);
        this.guilds = new GuildCollection_1.default(this);
        this.commands = new CommandCollection_1.default(this);
        this.modules = new ModuleCollection_1.default(this);
        await this.modules.load();
        if (baseConfig_1.default.dev) {
            this.modules.register();
            this.commands.register();
        }
        await this.eris.connect();
        const connectedShards = new Set();
        const connectListener = (id) => {
            connectedShards.add(id);
            if (connectedShards.size === (baseConfig_1.default.cluster.lastShard - baseConfig_1.default.cluster.firstShard + 1)) {
                this.eris.off('connect', connectListener);
                setTimeout(() => this.ipc.send('ready'), 5000);
            }
        };
        this.eris.on('connect', connectListener);
    }
}
exports.default = App;
//# sourceMappingURL=App.js.map