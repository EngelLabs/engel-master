"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
const Eris_1 = require("./clients/Eris");
const baseConfig_1 = require("./utils/baseConfig");
const StateManager_1 = require("./managers/StateManager");
const EventManager_1 = require("./managers/EventManager");
const CommandCollection_1 = require("./collections/CommandCollection");
const GuildCollection_1 = require("./collections/GuildCollection");
const ModuleCollection_1 = require("./collections/ModuleCollection");
class Core extends core.Core {
    erisClient = Eris_1.default;
    baseConfig = baseConfig_1.default;
    events;
    state;
    guilds;
    commands;
    modules;
    log(message, level = 'debug', prefix) {
        if (!message) {
            return;
        }
        try {
            message = `[${baseConfig_1.default.client.name.toUpperCase()}-C${baseConfig_1.default.cluster.id}] [${prefix || this.constructor.name}] ${message}`;
        }
        catch { }
        this.logger.log({ message, level });
    }
    async setup() {
        this.events = new EventManager_1.default(this);
        this.state = new StateManager_1.default(this);
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
                setTimeout(() => process.send('ready'), 5000);
            }
        };
        this.eris.on('connect', connectListener);
    }
}
exports.default = Core;
//# sourceMappingURL=Core.js.map