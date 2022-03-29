"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
class CommandCollection extends core.Collection {
    _core;
    constructor(core) {
        super();
        this._core = core;
        this.load();
    }
    _log(message, level) {
        this._core.log(message, level, 'Commands');
    }
    load() {
        const commands = this._core.config.commands;
        for (const key in commands) {
            const command = Object.assign({}, commands[key]);
            command.rootName = command.name.split('_')[0];
            command.isSubcommand = command.name.includes('_');
            this.set(command.name, command);
            this._log(`Loaded "${command.name}"`);
        }
        this._log(`${this.size} registered.`, 'info');
    }
}
exports.default = CommandCollection;
//# sourceMappingURL=CommandCollection.js.map