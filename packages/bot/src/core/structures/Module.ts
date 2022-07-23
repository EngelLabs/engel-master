import * as path from 'path';
import type * as eris from 'eris';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import Base from './Base';
import type Command from './Command';
import type Context from './Context';
import type App from '../structures/App';
const reload = require('require-reload')(require);

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
        private _logger: core.Logger;
        public debug?(channel: eris.TextChannel, guildConfig: types.Guild, msgArray: string[], infoArray: string[]): void;
        public injectHook?(): void;
        public ejectHook?(): void;
        public commandCheck?(ctx: Context): boolean | Promise<boolean>;

        public constructor() {
                super();

                this.name = this.constructor.name;
                this.dbName = this.name.toLowerCase();
        }

        public get logger() {
                if (!this._logger) {
                        this._logger = this.app.logger.get('Modules').get(this.name);
                }

                return this._logger;
        }

        public get globalConfig(): types.GlobalModuleConfig | undefined {
                if (this.internal || this.private || this.disabled) {
                        return;
                }

                const ret = <types.GlobalModuleConfig>{};

                const fields = [
                        'name',
                        'dbName',
                        'info',
                        'aliases',
                        'allowedByDefault'
                ];

                for (const key of fields) {
                        /* eslint-disable-next-line keyword-spacing */
                        const value = (<any>this)[key];

                        if (value === undefined) continue;
                        if (value instanceof Array && !value.length) continue;

                        (<any>ret)[key] = value;
                }

                return ret;
        }

        /**
         * Load any commands that belong to this module
         */
        private async loadCommands(): Promise<void> {
                const dir = path.resolve(__dirname, '../../modules/' + this.name + '/commands');

                try {
                        var files = (await this.utils.readdir(dir))
                                .filter(f => f.endsWith('.js'));
                } catch (err) {
                        return;
                }

                const commands = [];

                for (const file of files) {
                        const command = reload(dir + '/' + file).default;

                        if (!command || !Object.keys(command).length) {
                                this.logger.error(`No command found for "${dir}"`);
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
        private async loadListeners(): Promise<void> {
                const dir = path.resolve(__dirname, '../../modules/' + this.name + '/listeners');

                try {
                        var files = (await this.utils.readdir(dir))
                                .filter(f => f.endsWith('.js'));
                } catch (err) {
                        return;
                }

                const listeners = [];

                for (const file of files) {
                        let listener = reload(dir + '/' + file).default;

                        if (!listener || !Object.keys(listener).length) {
                                this.logger.error(`No listener found for "${dir}"`);
                                continue;
                        }

                        if (typeof listener === 'object') {
                                listener.event = listener.event || listener.name;
                        } else if (typeof listener === 'function') {
                                listener.event = (listener.event || listener.name).replace('bound', '').trim();
                                listener = listener.bind(null, this);
                        } else {
                                this.logger.error(`Unknown listener ${listener} for path "${dir}"`);
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
        public async inject(app: App) {
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

                                app.commands.add(command);
                        }
                }

                if (this.listeners && this.eris && this.app.events) {
                        for (const listener of this.listeners) {
                                this._boundListeners = this._boundListeners || [];

                                const copied = {
                                        name: (<string>(listener.event || listener.name)).replace('bound', '').trim(),
                                        execute: <(...args: any) => any>(listener.execute || listener)
                                };

                                copied.execute = copied.execute.bind(this);

                                this._boundListeners.push(copied);
                                app.events.registerListener(<types.EventNames>copied.name, copied.execute);
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
        public eject(app: App) {
                if (this.ejectHook) {
                        this.ejectHook();
                }

                if (this.commands) {
                        for (const command of this.commands) {
                                app.commands.remove(command);
                        }
                }

                if (this._boundListeners) {
                        for (const listener of this._boundListeners) {
                                app.events.unregisterListener(<types.EventNames>listener.name, listener.execute);
                        }
                }

                if (this.tasks) {
                        for (const [task] of this.tasks) {
                                clearInterval(task.actual);
                        }
                }
        }

        public isEnabled(guildConfig: types.Guild): boolean {
                if (guildConfig.modules?.[this.dbName]?.disabled) {
                        return false;
                }

                return true;
        }
}
