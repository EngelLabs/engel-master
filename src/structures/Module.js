const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);
const logger = require('../core/logger');


class Module {
    constructor() {
        if (new.target === Module) {
            throw new Error('Cannot construct Module instances directly');
        }

        this.name = new.target.name;
        this.dbName = this.name.toLowerCase();

        this.loadCommands();
        this.loadListeners();
    }

    get eris() {
        return this.bot.eris;
    }

    get models() {
        return this.bot.models;
    }

    get logger() {
        return logger;
    }

    log(msg, level = 'info') {
        if (level === 'error') {
            logger.error(`[Modules.${this.name}] Something went wrong.`);
            console.error(msg);
        } else {
            logger[level](`[Modules.${this.name}] ${msg}`);
        }
    }

    get _dir() {
        return path.resolve() + '/src/modules/' + this.name;
    }

    getConfig() {
        const ret = { disabled: false, name: this.dbName };

        if (this.info && this.info.length) ret.info = this.info;

        if (this.aliases && this.aliases.length) ret.aliases = this.aliases;

        return Object.assign(ret, this.config);
    }

    loadCommands() {
        let path = this._dir + '/commands/'

        try {
            var files = fs.readdirSync(path);
        } catch (err) {
            // most likely that commands directory doesn't exist.
            return;
        }

        const commands = [];

        for (let file of files) {
            let command = reload(path + file);

            if (!command || !Object.keys(command)) {
                logger.error(`[Modules.${this.name}] No command found for "${path}"`);
                continue;
            }

            commands.push(command);
        }

        if (commands.length) this.commands = commands;
    }

    loadListeners() {
        let path = this._dir + '/listeners/'

        try {
            var files = fs.readdirSync(path);
        } catch (err) {
            // most likely that listeners directory doesn't exist.
            return;
        }

        const listeners = [];

        for (let file of files) {
            let listener = reload(path + file);

            if (!listener || !Object.keys(listener)) {
                logger.error(`[Modules.${this.name}] No listener found for "${path}"`);
                continue;
            }

            if (typeof listener === 'object') {
                listener.name = listener.event || listener.name;
            } else if (typeof listener === 'function') {
                listener.event = (listener.event || listener.name).replace('bound', '').trim();
                listener = listener.bind(null, this);
            } else {
                logger.error(`[Modules.${this.name}] Unknown listener ${listener} for path "${path}"`);
            }

            listeners.push(listener);
        }

        if (listeners.length) this.listeners = listeners;
    }

    inject(bot) {
        if (!bot) return;

        this.bot = bot;

        if (this.injectHook) {
            try {
                this.injectHook()
            } catch (err) {
                logger.error(err);
            }
        }

        if (this.commands) {
            for (const command of this.commands) {
                command.module = this;

                bot.commands.add(command);
            }
        }

        if (this.listeners) {
            for (const listener of this.listeners) {
                this._boundListeners = this._boundListeners || [];

                const copied = {
                    name: (listener.event || listener.name).replace('bound', '').trim(),
                    execute: listener.execute || listener
                };

                copied.execute = copied.execute.bind(this);

                this._boundListeners.push(copied);
                bot.eris.addListener(copied.name, copied.execute);
            }
        }

        if (this.botListeners) {
            for (const listener of this.botListeners) {
                this._boundBotListeners = this._boundBotListeners || [];

                const copied = {
                    name: (listener.event || listener.name).replace('bound', '').trim(),
                    execute: listener.execute || listener
                };

                copied.execute = copied.execute.bind(this);

                this._boundBotListeners.push(copied);
                bot.addListener(copied.name, copied.execute);
            }
        }

        if (this.tasks) {
            for (const [task, interval] of this.tasks) {
                task.actual = setInterval(task, interval);
            }
        }
    }

    eject(bot) {
        if (!bot) return;

        if (this.ejectHook) {
            try {
                this.ejectHook();
            } catch (err) {
                logger.error(err);
            }
        }

        if (this.commands) {
            for (const command of this.commands) {
                bot.commands.remove(command);
            }
        }

        if (this._boundListeners) {
            for (const listener of this._boundListeners) {
                bot.eris.removeListener(listener.name, listener.execute);
            }
        }

        if (this._boundBotListeners) {
            for (const listener of this._boundBotListeners) {
                bot.removeListener(listener.name, listener.execute);
            }
        }

        if (this.tasks) {
            for (const [task, _] of this.tasks) {
                clearInterval(task.actual);
            }
        }
    }
}


module.exports = Module;