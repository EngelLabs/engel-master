import * as eris from 'eris';
import { types } from '@engel/core';
import CommandCollection from '../collections/CommandCollection';
import Context from './Context';
import Module from './Module';


interface CommandOptions<M extends Module> {
        name: string;
        info?: string;
        usage?: string;
        hidden?: boolean;
        cooldown?: number;
        aliases?: string[];
        disabled?: boolean;
        examples?: string[];
        namespace?: boolean;
        dmEnabled?: boolean;
        requiredArgs?: number;
        alwaysEnabled?: boolean;
        disableModuleCheck?: boolean;
        requiredPermissions?: Array<keyof eris.Constants['Permissions']>;
        debug?: (command: Command<M>, channel: eris.TextChannel, guildConfig: types.GuildConfig) => [string[], string[]];
        check?: (ctx: Context<M, Command<M>>) => boolean | Promise<boolean>;
        before?: (ctx: Context<M, Command<M>>) => void | Promise<void>;
        after?: (ctx: Context<M, Command<M>>) => void | Promise<void>;
        execute?: (ctx: Context<M, Command<M>>) => any | Promise<any>;
}


interface Command<M extends Module> extends CommandOptions<M> {}


/**
 * Represents a core command
 */
/* eslint-disable no-redeclare */
class Command<M extends Module = Module> {
        public commands?: CommandCollection;
        private _module?: M;
        private _parent?: Command<M>;

        public constructor(options: CommandOptions<M>) {
                Object.assign(this, options);
        }

        public get rootName(): string {
                return this.parent ? this.parent.rootName : this.name;
        }

        public get qualName(): string {
                let qualName = this.name;
                let command: Command<M> = this;

                while (command.parent) {
                        qualName = command.parent.name + ' ' + qualName;
                        command = command.parent;
                }

                return qualName
        }

        public get dbName(): string {
                return this.qualName.replace(' ', '_');
        }

        public get module(): M {
                return this._module || this.parent.module;
        }

        public set module(value: M) {
                this._module = value;
        }

        public get parent(): Command<M> | undefined {
                return this._parent;
        }

        public set parent(command: Command<M>) {
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

        public get globalConfig(): types.GlobalCommandConfig {
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

        public command(options: CommandOptions<M>): Command<M> {
                let subcommand = new Command<M>(options);

                subcommand.parent = this;

                return subcommand;
        }

        public isEnabled(guildConfig: types.GuildConfig, returnName: true): [boolean, string];
        public isEnabled(guildCOnfig: types.GuildConfig, returnName: false): boolean;
        public isEnabled(guildConfig: types.GuildConfig, returnName: boolean = false) {
                const resolve = returnName
                        ? (enabled: boolean, name?: string) => [enabled, name]
                        : (enabled: boolean) => enabled;

                if (guildConfig.commands) {
                        const commands = guildConfig.commands;

                        let name = this.rootName;

                        // @ts-ignore
                        // Typescript being fucking cancer and telling me that commands[name] can be a boolean
                        if (typeof commands[name] !== 'boolean' && commands[name].disabled) {
                                return resolve(false, name);
                        }

                        if (this.parent && commands[this.dbName] === false) {
                                return resolve(false, this.qualName);
                        }
                }

                return resolve(true);
        }

        public async execute(ctx: Context<M, Command<M>>): Promise<any> {
                throw new Error(`Unreachable code.`);
        }
}


export default Command;
