import * as fs from 'fs';
import * as path from 'path';
import * as eris from 'eris';
import { types } from '@engel/core';
const reload = require('require-reload')(require);
import Base from './Base';
import Command from './Command';
import Context from './Context';
import Core from '../Core';


/**
 * Base class for classes that represent a module
 */
export default class Module extends Base {
        public name: string;
        public dbName: string;
        public info?: string;
        public private?: boolean;
        public aliases?: string[];
        public internal?: boolean;
        public disabled?: boolean;
        public allowedByDefault?: boolean;
        public tasks?: Array<[types.Task, number]>;
        public commands?: Array<Command>;
        public listeners?: Array<types.Listener>;
        private _boundListeners?: Array<types.ListenerObject>;
        public debug?(channel: eris.TextChannel, guildConfig: types.GuildConfig, msgArray: string[], infoArray: string[]): void;
        public injectHook?(): void;
        public ejectHook?(): void;
        public commandCheck?(ctx: Context): boolean | Promise<boolean>;

        public constructor() {
                super();

                this.name = this.constructor.name;

                this.dbName = this.name.toLowerCase();

                this.loadCommands();
                this.loadListeners();
        }

        public get logPrefix(): string {
                return `Modules.${this.name}`;
        }

        public get globalConfig(): types.GlobalModuleConfig | undefined {
                if (this.internal || this.private || this.disabled) {
                        return;
                }

                const ret = {};

                const fields = [
                        'name',
                        'dbName',
                        'info',
                        'aliases',
                        'allowedByDefault',
                ]

                for (const key of fields) {
                        const value = this[key];

                        if (value === undefined) continue;
                        if (value instanceof Array && !value.length) continue;

                        ret[key] = value;
                }

                // @ts-ignore
                return ret;
        }

        /**
         * Load any commands that belong to this module
         */
        public loadCommands(): void {
                let dir = path.resolve(__dirname, '../../modules/' + this.name + '/commands');

                try {
                        var files = fs.readdirSync(dir);
                } catch (err) {
                        return;
                }

                const commands = [];

                for (let file of files) {
                        let command = reload(dir + '/' + file).default;

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

        /**
         * Load any event listeners that belong to this module
         */
        loadListeners(): void {
                let dir = path.resolve(__dirname, '../../modules/' + this.name + '/listeners');

                try {
                        var files = fs.readdirSync(dir);
                } catch (err) {
                        return;
                }

                const listeners = [];

                for (let file of files) {
                        let listener = reload(dir + '/' + file).default;

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

                if (listeners.length) {
                        this.listeners = listeners;
                }
        }

        /**
         * Inject the module
         */
        inject(core: Core) {
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

                                core.commands.add(command);
                        }
                }

                if (this.listeners && this.eris && this.core.events) {
                        for (const listener of this.listeners) {
                                this._boundListeners = this._boundListeners || [];

                                const copied = {
                                        name: (<string>(listener.event || listener.name)).replace('bound', '').trim(),
                                        execute: <(...args: any) => any>(listener.execute || listener)
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

        /**
         * Eject the module
         */
        public eject(core: Core) {
                if (this.ejectHook) {
                        try {
                                this.ejectHook();
                        } catch (err) {
                                this.log(err, 'error');
                        }
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
                        for (const [task, _] of this.tasks) {
                                clearInterval(task.actual);
                        }
                }
        }

        public isEnabled(guildConfig: types.GuildConfig): boolean {
                if (guildConfig[this.dbName]?.disabled) {
                        return false;
                }

                return true;
        }
}