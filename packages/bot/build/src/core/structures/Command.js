"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandCollection_1 = require("../collections/CommandCollection");
class Command {
    commands;
    _module;
    _parent;
    constructor(options) {
        Object.assign(this, options);
    }
    get rootName() {
        return this.parent ? this.parent.rootName : this.name;
    }
    get qualName() {
        let qualName = this.name;
        let command = this;
        while (command.parent) {
            qualName = command.parent.name + ' ' + qualName;
            command = command.parent;
        }
        return qualName;
    }
    get dbName() {
        return this.qualName.replace(' ', '_');
    }
    get module() {
        return this._module || this.parent.module;
    }
    set module(value) {
        this._module = value;
    }
    get parent() {
        return this._parent;
    }
    set parent(command) {
        if (this._parent) {
            throw new Error(`Subcommand is already registered to ${this._parent.qualName}`);
        }
        if (!command.commands) {
            command.commands = new CommandCollection_1.default();
        }
        if (command.commands.get(this.name)) {
            throw new Error(`Duplicate subcommand "${this.name}"`);
        }
        this._parent = command;
        command.commands.add(this);
    }
    get globalConfig() {
        if (this.hidden ||
            this.disabled ||
            this.module.private ||
            this.module.internal ||
            this.module.disabled)
            return;
        const ret = { name: this.dbName, module: this.module.dbName };
        const fields = [
            'info',
            'aliases',
            'usage',
            'examples',
            'cooldown',
            'requiredPermissions',
            'dmEnabled',
            'alwaysEnabled',
            'requiredArgs'
        ];
        for (const key of fields) {
            const value = this[key];
            if (value === undefined)
                continue;
            if (value instanceof Array && !value.length)
                continue;
            ret[key] = value;
        }
        return ret;
    }
    command(options) {
        const subcommand = new Command(options);
        subcommand.parent = this;
        return subcommand;
    }
    isEnabled(guildConfig, returnName = false) {
        const resolve = returnName
            ? (enabled, name) => [enabled, name]
            : (enabled) => enabled;
        if (guildConfig.commands) {
            const commands = guildConfig.commands;
            const name = this.rootName;
            if (typeof commands[name] === 'object' && commands[name].disabled) {
                return resolve(false, name);
            }
            if (this.parent && commands[this.dbName] === false) {
                return resolve(false, this.qualName);
            }
        }
        return resolve(true);
    }
    async execute(ctx) {
        throw new Error('Unreachable code.');
    }
}
exports.default = Command;
//# sourceMappingURL=Command.js.map