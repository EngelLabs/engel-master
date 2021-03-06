import * as core from '@engel/core';
import type * as eris from 'eris';
import type Command from '../structures/Command';
import type App from '../structures/App';

export default class CommandCollection extends core.Collection<Command> {
        private _app?: App;

        public constructor(app?: App) {
                super();

                if (app) {
                        this._app = app;
                }
        }

        public register(): Promise<void> {
                const update: any = {};

                this.all()
                        .map(command => command.globalConfig)
                        .forEach(c => {
                                if (!c) return;

                                update[`commands.${c.name}`] = c;
                        });

                return new Promise((resolve, reject) => {
                        this._app.mongo.configurations.updateOne({ state: this._app.staticConfig.client.state }, { $set: update })
                                .then(() => resolve())
                                .catch(reject);
                });
        }

        /**
        * Get help for a command in the form of an embed object.
        * @param command Command object
        * @param param Prefix to use in return value
        * @param includeHidden Whether to include hidden values
        * @param verbose Whether to add verbose footer
        */
        public help(commandName: string, prefix: string = '?', includeHidden: boolean = false, verbose: boolean = true): eris.EmbedOptions {
                const command = this.get(commandName, true);

                if (!command || ((command.module.private || command.module.internal || command.module.disabled) && !includeHidden)) return;

                const qualName = command.qualName;

                const embed: eris.EmbedOptions = {
                        title: `Command "${qualName}" info`,
                        description: `**Module:** ${command.module.name}`,
                        color: this._app.config.colours.info
                };

                if (command.usage?.length) {
                        embed.description += `\n**Usage:** ${prefix}${qualName} ${command.usage}`;
                } else {
                        embed.description += `\n**Usage:** ${prefix}${qualName}`;
                }

                if (command.cooldown) {
                        embed.description += `\n**Cooldown:** ${command.cooldown / 1000} seconds`;
                }

                if (command.info?.length) {
                        embed.description += `\n**Info:** ${command.info}`;
                }

                if (command.aliases?.length) {
                        embed.description += `\n**Aliases:** ${command.aliases.join(', ')}`;
                }

                if (command.commands) {
                        const commands = command.commands.unique()
                                .filter(cmd => !(cmd.hidden && !includeHidden));
                        const msg = commands
                                .map(cmd => cmd.name)
                                .join(', ');

                        if (msg?.length) {
                                embed.description += `\n**Subcommands [${commands.length}]:** ${msg}`;

                                if (verbose) {
                                        embed.footer = {
                                                text: `Use "${prefix}help ${qualName} <subcommand>" for more info`
                                        };
                                }
                        }
                }

                if (command.examples?.length) {
                        embed.description += `\n**Examples:**\n${command.examples.map(e => prefix + e).join('\n')}`;
                }

                if (verbose) {
                        embed.footer = embed.footer || { text: '' };

                        embed.footer.text += `\nConfused? Check out "${prefix}help bot"`;
                }

                return embed;
        }

        public all(): Command[] {
                const ret: Command[] = [];

                for (const command of this.unique()) {
                        ret.push(command);
                        if (command.commands) {
                                ret.push(...command.commands.all());
                        }
                }

                return ret.flat();
        }

        public get(key: string, recursive: boolean = false): Command {
                if (!recursive) {
                        return super.get(key);
                }

                const keys = key.split(' ');
                let command: Command = super.get(keys.shift());

                while (command?.commands && keys.length) {
                        const subcommand = command.commands.get(keys.shift());

                        if (!subcommand) {
                                break;
                        }

                        command = subcommand;
                }

                return command;
        }
}
