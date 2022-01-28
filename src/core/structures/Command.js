const CommandCollection = require('../collections/CommandCollection');


/**
 * Represents a bot command
 */
class Command {
        constructor(options) {
                if (!options) {
                        throw new Error('Must provide "options" argument');
                }

                Object.assign(this, options);

                // TODO?: Runtime checking for attributes since I'm a dumbass
        }

        get module() {
                return this._module || this.parent.module;
        }

        set module(module) {
                this._module = module;
        }

        get parent() {
                return this._parent;
        }

        get commands() {
                return this._commands;
        }

        set commands(value) {
                return (this._commands = value);
        }

        set parent(command) {
                if (this._parent) {
                        throw new Error(`Subcommand is already registered to ${this._parent.qualName}`)
                }

                if (!command.commands) {
                        command.commands = new CommandCollection();
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
                        this.module.disabled) return;

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
                        'requiredArgs',
                ];

                for (const key of fields) {

                        const value = this[key];

                        if (value === undefined) continue;
                        if (value instanceof Array && !value.length) continue;

                        ret[key] = value;
                }

                return ret;
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

                return qualName
        }

        get dbName() {
                return this.qualName.replace(' ', '_');
        }

        command(options) {
                let subcommand = new Command(options);

                subcommand.parent = this;

                return subcommand;
        }
}


module.exports = Command;