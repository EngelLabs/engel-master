const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);
const Base = require('./Base');


/**
 * Base class for classes that represent a module
 * @class Module
 */
class Module extends Base {
    /**
     * @property {String} dbName The module's internal name (used as database keys)
     */
    constructor() {
        if (new.target === Module) {
            throw new Error('Cannot construct Module instances directly');
        }

        super();

        /**
         * The module's name
         * @type {String}
         */
        this.name = this.constructor.name;

        /**
         * The module's internal name (used as database keys)
         * @type {String}
         */
        this.dbName = this.name.toLowerCase();

        this.loadCommands();
        this.loadListeners();
    }

    /**
     * Log a message
     * @param {String} msg The message to log
     * @param {String} level The logging severity
     * @param {String} prefix Module name (for context)
     * @returns {any}
     */
    log(msg, level = 'info', prefix) {
        prefix = prefix || this.name;

        return super.log(msg, level, `Modules.${prefix}`);
    }

    get globalConfig() {
        if (this.internal || this.private || this.disabled) return;

        const ret = {};

        const fields = [
            'name',
            'dbName',
            'info',
            'aliases',
            'allowedByDefault',
            'requiredPermissions',
        ]

        for (const key of fields) {
            const value = this[key];
            
            if (value === undefined) continue;
            if (value instanceof Array && !value.length) continue;

            ret[key] = value;
        }

        return ret;
    }

    /**
     * Load any commands that belong to this module
     * @returns {void}
     */
    loadCommands() {
        let dir = path.resolve('src/modules/' + this.name + '/commands');

        try {
            var files = fs.readdirSync(dir);
        } catch (err) {
            return;
        }

        const commands = [];

        for (let file of files) {
            let command = reload(dir + '/' + file);

            if (!command || !Object.keys(command).length) {
                this.log(`No command found for "${dir}"`, 'error');
                continue;
            }

            commands.push(command);
        }

        if (commands.length) this.commands = commands;
    }

    /**
     * Load any event listeners that belong to this module
     * @returns {void}
     */
    loadListeners() {
        let dir = path.resolve('src/modules/' + this.name + '/listeners');

        try {
            var files = fs.readdirSync(dir);
        } catch (err) {
            return;
        }

        const listeners = [];

        for (let file of files) {
            let listener = reload(dir + '/' + file);

            if (!listener || !Object.keys(listener).length) {
                this.log(`No listener found for "${dir}"`, 'error');
                continue;
            }

            if (typeof listener === 'object') {
                listener.event = listener.event || listener.name;
            } else if (typeof listener === 'function') {
                listener.event = (listener.event || listener.name).replace('bound', '').trim();
                listener = listener.bind(null, this);
            } else {
                this.log(`Unknown listener ${listener} for path "${dir}"`, 'error');
            }

            listeners.push(listener);
        }

        if (listeners.length) this.listeners = listeners;
    }

    /**
     * Inject the module
     * @param {Bot} bot The bot instance
     */
    inject(bot) {
        if (this.injectHook) {
            try {
                this.injectHook()
            } catch (err) {
                this.log(err, 'error');
            }
        }

        if (this.commands) {
            for (const command of this.commands) {
                command.module = this;

                bot.commands.add(command);
            }
        }

        if (this.listeners && this.eris && this.bot.events) {
            for (const listener of this.listeners) {
                this._boundListeners = this._boundListeners || [];

                const copied = {
                    name: (listener.event || listener.name).replace('bound', '').trim(),
                    execute: listener.execute || listener
                };

                copied.execute = copied.execute.bind(this);

                this._boundListeners.push(copied);
                bot.events.registerListener(copied.name, copied.execute);
            }
        }

        if (this.tasks) {
            for (const [task, interval] of this.tasks) {
                task.actual = setInterval(task, interval);
            }
        }
    }

    /**
     * Eject the module
     * @param {Bot} bot The bot instance
     */
    eject(bot) {
        if (this.ejectHook) {
            try {
                this.ejectHook();
            } catch (err) {
                this.log(err, 'error');
            }
        }

        if (this.commands) {
            for (const command of this.commands) {
                bot.commands.remove(command);
            }
        }

        if (this._boundListeners) {
            for (const listener of this._boundListeners) {
                bot.events.unregisterListener(listener.name, listener.execute);
            }
        }

        if (this.tasks) {
            for (const [task, _] of this.tasks) {
                clearInterval(task.actual);
            }
        }
    }

    /**
     * Pre-inject hook
     * @abstract
     * @returns {any}
     */
    injectHook() {}

    /**
     * Pre-eject hook
     * @abstract
     * @returns {any}
     */
    ejectHook() {}
}


module.exports = Module;