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
        this.tasks = [];
        this.commands = [];
        this.listeners = [];

        this.loadCommands();
        this.loadListeners();
    }

    get eris() {
        return this.bot.eris;
    }
    
    get logger() {
        return logger;
    }

    get dbName() {
        return this.name.toLowerCase();
    }

    get _dir() {
        return path.resolve() + '/src/modules/' + this.name;
    }

    getConfig() {
        const ret = { enabled: true, name: this.dbName };

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

        for (let file of files) {
            let command = reload(path + file);

            if (!command || !Object.keys(command)) {
                logger.error(`[Modules.${this.name}] No command found for "${path}"`);
                continue;
            }
            
            command.module = this;
        
            this.commands.push(command);
        }
    }

    loadListeners() {
        let path = this._dir + '/listeners/'

        try {
            var files = fs.readdirSync(path);
        } catch (err) {
            // most likely that listeners directory doesn't exist.
            return;
        }

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

            this.listeners.push(listener);
        }
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