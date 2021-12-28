const CommandCollection = require('../collections/CommandCollection');
const logger = require('../utils/logger');


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

    get globalConfig() {
        if (this.hidden ||
            this.module.private ||
            this.module.internal) return;

        const ret = {};

        for (const key in this) {
            const value = this[key];
            
            if (value instanceof Array && !value.length) {
                logger.debug(`[Commands.${this.dbName}] Skipping "${key}": Array's length is 0.`);
                continue;
            }

            ret[key] = value;
        }

        ret.name = this.dbName;
        
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