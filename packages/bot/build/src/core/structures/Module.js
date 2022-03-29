"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const Base_1 = require("./Base");
const reload = require('require-reload')(require);
class Module extends Base_1.default {
    name;
    dbName;
    info;
    private;
    aliases;
    internal;
    disabled;
    allowedByDefault;
    tasks;
    commands;
    listeners;
    _boundListeners;
    constructor() {
        super();
        this.name = this.constructor.name;
        this.dbName = this.name.toLowerCase();
    }
    get logPrefix() {
        return `Modules.${this.name}`;
    }
    get globalConfig() {
        if (this.internal || this.private || this.disabled) {
            return;
        }
        const ret = {};
        const fields = [
            'name',
            'dbName',
            'info',
            'aliases',
            'allowedByDefault'
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
    async loadCommands() {
        const dir = path.resolve(__dirname, '../../modules/' + this.name + '/commands');
        try {
            var files = (await this.utils.readdir(dir))
                .filter(f => f.endsWith('.js'));
        }
        catch (err) {
            return;
        }
        const commands = [];
        for (const file of files) {
            const command = reload(dir + '/' + file).default;
            if (!command || !Object.keys(command).length) {
                this.log(`No command found for "${dir}"`, 'error');
                continue;
            }
            commands.push(command);
        }
        if (commands.length) {
            this.commands = commands;
        }
    }
    async loadListeners() {
        const dir = path.resolve(__dirname, '../../modules/' + this.name + '/listeners');
        try {
            var files = (await this.utils.readdir(dir))
                .filter(f => f.endsWith('.js'));
        }
        catch (err) {
            return;
        }
        const listeners = [];
        for (const file of files) {
            let listener = reload(dir + '/' + file).default;
            if (!listener || !Object.keys(listener).length) {
                this.log(`No listener found for "${dir}"`, 'error');
                continue;
            }
            if (typeof listener === 'object') {
                listener.event = listener.event || listener.name;
            }
            else if (typeof listener === 'function') {
                listener.event = (listener.event || listener.name).replace('bound', '').trim();
                listener = listener.bind(null, this);
            }
            else {
                this.log(`Unknown listener ${listener} for path "${dir}"`, 'error');
            }
            listeners.push(listener);
        }
        if (listeners.length) {
            this.listeners = listeners;
        }
    }
    async inject(core) {
        await Promise.all([
            this.loadCommands(),
            this.loadListeners()
        ]);
        if (this.injectHook) {
            this.injectHook();
        }
        if (this.commands) {
            for (const command of this.commands) {
                command.module = this;
                core.commands.add(command);
            }
        }
        if (this.listeners && this.eris && this.core.events) {
            for (const listener of this.listeners) {
                this._boundListeners = this._boundListeners || [];
                const copied = {
                    name: (listener.event || listener.name).replace('bound', '').trim(),
                    execute: (listener.execute || listener)
                };
                copied.execute = copied.execute.bind(this);
                this._boundListeners.push(copied);
                core.events.registerListener(copied.name, copied.execute);
            }
        }
        if (this.tasks) {
            for (const [task, interval] of this.tasks) {
                task.actual = setInterval(task, interval);
            }
        }
    }
    eject(core) {
        if (this.ejectHook) {
            this.ejectHook();
        }
        if (this.commands) {
            for (const command of this.commands) {
                core.commands.remove(command);
            }
        }
        if (this._boundListeners) {
            for (const listener of this._boundListeners) {
                core.events.unregisterListener(listener.name, listener.execute);
            }
        }
        if (this.tasks) {
            for (const [task] of this.tasks) {
                clearInterval(task.actual);
            }
        }
    }
    isEnabled(guildConfig) {
        if (guildConfig.modules?.[this.dbName]?.disabled) {
            return false;
        }
        return true;
    }
}
exports.default = Module;
//# sourceMappingURL=Module.js.map