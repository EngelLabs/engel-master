const CommandCollection = require('../collections/CommandCollection');
const logger = require('../core/logger');
// const { ApplicationCommandOptionTypes } = require('eris').Constants;


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

    get rich() {
        return this._rich || !this.parent;
    }

    set rich(value) {
        this._rich = value;
    }

    get config() {
        if (this.hidden ||
            this.module.private ||
            this.module.internal) return;
            
        const ret = { disabled: false, name: this.dbName };

        if (this.usage && this.usage.length) ret.usage = this.usage;
        if (this.info && this.info.length) ret.info = this.info;
        if (this.cooldown) ret.cooldown = this.cooldown;
        if (this.aliases && this.aliases.length) ret.aliases = this.aliases;
        if (this.examples && this.examples.length) ret.examples = this.examples;
        if (this.alwaysEnabled) ret.alwaysEnabled = this.alwaysEnabled;
        if (this.requiredPermissions && this.requiredPermissions.length) {
            ret.requiredPermissions = this.requiredPermissions;
        }

        return Object.assign(ret, this._config);
    }

    set config(config) {
        this._config = config;
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

    register(eris) {
        logger.info(`registering command ${this.qualName}`);
        const promises = [];
        const options = [];
        if (this.commands) {
            for (command of this.commands) {
                promises.push(...command.register(eris));
            }
        }

        promises.push(eris.createCommand({
            name: this.name.toLowerCase(),
            type: 1,
            description: this.info,
            options,
        }));

        return Promise.all(promises);
    }

    register(eris) {
        if (this.hidden ||
            this.module.internal ||
            this.module.private) return false;

        if (this.parent) {
            const ret = {
                name: this.name.toLowerCase(),
                description: this.info,
                type: this.commands && this.commands.size ? 2 : 1,
                options: [],
            };

            if (this.choices) {
                const choices = [];

                for (const choice of this.choices) {
                    choices.push({
                        name: Object.keys(choice)[0],
                        value: Object.values(choice)[0]
                    });
                }
            }
            
            if (this.commands) {
                for (const command of this.commands) {
                    if (command.hidden) continue;

                    ret.options.push(command.register(eris));
                }
            }

            return ret;
        }

        const options = []; 

        if (this.commands) {
            for (const command of this.commands.unique()) {
                if (command.hidden) continue;

                options.push(command.register(eris));
            }
        }
        // require('eris').Client.prototype.createGuildCommand
        return eris.createGuildCommand('828010463476056137', {
            name: this.name.toLowerCase(),
            type: 1,
            description: this.info,
            options,
        })
    }
}


module.exports = Command;