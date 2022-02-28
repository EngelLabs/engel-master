import * as eris from 'eris';
import { types } from '@engel/core';
import Module from '../../core/structures/Module';
import Command from '../../core/structures/Command';

export default class Manager extends Module {
        public constructor() {
                super();

                this.aliases = ['management'];
                this.info = 'Commands to manage and configure your server';
        }

        private _debug(channel: eris.TextChannel, guildConfig: types.GuildConfig): [string[], string[]] {
                const msgArray = [];
                const infoArray = [];

                // const perms = channel.permissionsOf(this.eris.user.id);

                const fmt = guildConfig.prefixes.map(p => `\`${p}\``).join(', ');

                infoArray.push(`The prefix${guildConfig.prefixes.length > 1 ? 'es' : ''} for this server: ${fmt}`);

                return [msgArray, infoArray];
        }

        public debugCommand(
                command: Command,
                channel: eris.TextChannel,
                guildConfig: types.GuildConfig
        ): eris.EmbedOptions {
                const config = this.config;

                const [msgArray, infoArray] = this._debug(channel, guildConfig);

                const embed: eris.EmbedOptions = {
                        title: `Command "${command.qualName}" debug`,
                        color: config.colours.info
                };

                if (command.dmEnabled) {
                        infoArray.push('This command can be used in DMs');
                }
                if (command.alwaysEnabled) {
                        infoArray.push('This command can not be disabled');
                }

                const checkPerms = (config: types.BaseConfig) => {
                        if (config.allowedRoles?.length) {
                                const allowedRoles = config.allowedRoles.filter(id => channel.guild.roles.has(id));
                                infoArray.push(`This command is allowed for the following roles: ${allowedRoles.map(id => `<@&${id}>`).join('\n')}`);
                        }

                        if (config.ignoredRoles?.length) {
                                const ignoredRoles = config.ignoredRoles.filter(id => channel.guild.roles.has(id));
                                infoArray.push(`This command is allowed for the following roles: ${ignoredRoles.map(id => `<@&${id}>`).join('\n')}`);
                        }

                        if (config.allowedChannels?.length) {
                                const allowedChannels = config.allowedChannels.filter(id => channel.guild.channels.has(id));
                                infoArray.push(`This command is allowed in the following channels: ${allowedChannels.map(id => `<#${id}>`).join('\n')}`);
                                if (!allowedChannels.find(id => id === channel.id)) {
                                        msgArray.push('This command is not allowed in the current channel');
                                }
                        }

                        if (config.ignoredChannels?.length) {
                                const ignoredChannels = config.ignoredChannels.filter(id => channel.guild.channels.has(id));
                                infoArray.push(`This command is not allowed in the following channels: ${ignoredChannels.map(id => `<#${id}>`).join('\n')}`);
                                if (!ignoredChannels.find(id => id === channel.id)) {
                                        msgArray.push('This command is allowed in the current channel');
                                }
                        }
                };

                if (guildConfig.commands?.[command.rootName]) {
                        // @ts-ignore
                        // We are dealing with rootName, here. Command config can not be a boolean.
                        // TODO?: Possibly something to work on.
                        checkPerms(guildConfig.commands[command.rootName]);
                } else if (guildConfig[command.module.dbName]) {
                        checkPerms(guildConfig[command.module.dbName]);
                } else {
                        checkPerms(guildConfig);
                }

                if (config.commands?.[command.dbName]?.disabled) {
                        msgArray.push('This command has been disabled globally');
                }

                // if (!guildConfig.commands || typeof guildConfig.commands[command.dbName] === 'undefined') {
                //     infoArray.push('This command hasn\'t been configured for this server yet');
                // }

                if (guildConfig.commands) {
                        const commands = guildConfig.commands;

                        if (command.parent) {
                                // @ts-ignore
                                // TODO?: Same thing as mentioned above
                                if (commands[command.rootName]?.disabled) {
                                        msgArray.push("This command's parent is disabled in this server");
                                }

                                if (commands[command.dbName] === false) {
                                        msgArray.push('This command is disabled in this server');
                                }
                        } else {
                                // @ts-ignore
                                // TODO?: And so the trend from above continues...
                                if (commands[command.name]?.disabled) {
                                        msgArray.push('This command is disabled in this server');
                                }
                        }
                }

                if (command.debug) {
                        command.debug(command, channel, guildConfig, msgArray, infoArray);
                }

                embed.description = `**Info:**\n${infoArray.join('\n')}\n`;
                embed.description += `**Debug:**\n${msgArray.join('\n') || 'This command seems to be working properly'}`;

                return embed;
        }

        public debugModule(
                module: Module,
                channel: eris.TextChannel,
                guildConfig: types.GuildConfig
        ): eris.EmbedOptions {
                const config = this.config;

                const [msgArray, infoArray] = this._debug(channel, guildConfig);

                const embed: eris.EmbedOptions = {
                        title: `Module "${module.name}" debug`,
                        color: config.colours.info
                };

                if (config.modules[module.dbName].disabled) {
                        msgArray.push('This module has been disabled globally');
                }

                if (!guildConfig[module.dbName]) {
                        infoArray.push('This module hasn\'t been configured for this server yet');
                }

                if (!module.isEnabled(guildConfig)) {
                        msgArray.push('This module is disabled in this server');
                }

                if (module.debug) {
                        module.debug(channel, guildConfig, msgArray, infoArray);
                }

                embed.description = `**Info:**\n${infoArray.join('\n')}\n`;
                embed.description += `**Debug:**\n${msgArray.join('\n') || 'This module seems to be working properly'}`;

                return embed;
        }
}
