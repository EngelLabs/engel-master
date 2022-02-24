import { types } from '@engel/core';
import CommandCollection from '../collections/CommandCollection';
import Context from './Context';
import Module from './Module';


interface CommandOptions {
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
        requiredPermissions?: string[];
        check?: (ctx: Context) => boolean | Promise<boolean>;
        before?: (ctx: Context) => void | Promise<void>;
        after?: (ctx: Context) => void | Promise<void>;
        execute: (ctx: Context) => any | Promise<any>;
}

/**
 * Represents a core command
 */
export default class Command {
        public name: string;
        public info?: string;
        public usage?: string;
        public hidden?: boolean;
        public cooldown?: number;
        public aliases?: string[];
        public disabled?: boolean;
        public examples?: string[];
        public namespace?: boolean;
        public dmEnabled?: boolean;
        public requiredArgs?: number;
        public alwaysEnabled?: boolean;
        public disableModuleCheck?: boolean;
        public requiredPermissions?: string[];
        public check?(ctx: Context): boolean | Promise<boolean>;
        public before?(ctx: Context): void | Promise<void>;
        public after?(ctx: Context): void | Promise<void>;
        private _module?: Module;
        private _parent?: Command;
        private _commands?: CommandCollection;

        public constructor(options: CommandOptions) {
                Object.assign(this, options);
        }

        public get rootName(): string {
                return this.parent ? this.parent.rootName : this.name;
        }

        public get qualName(): string {
                let qualName = this.name;
                let command: Command = this;

                while (command.parent) {
                        qualName = command.parent.name + ' ' + qualName;
                        command = command.parent;
                }

                return qualName
        }

        public get dbName(): string {
                return this.qualName.replace(' ', '_');
        }

        public get module(): Module {
                return this._module || this.parent.module;
        }

        public set module(value: Module) {
                this._module = value;
        }

        public get commands(): CommandCollection | undefined {
                return this._commands;
        }

        public set commands(value: CommandCollection) {
                this._commands = value;
        }

        public get parent(): Command | undefined {
                return this._parent;
        }

        public set parent(command: Command) {
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

        public command(options: CommandOptions): Command {
                let subcommand = new Command(options);

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

        public async execute() {
                throw new Error(`Unreachable code.`);
        }
}
