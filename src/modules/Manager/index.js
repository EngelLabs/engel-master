const Module = require('../../core/structures/Module');


class Manager extends Module {
    constructor() {
        super();

        this.aliases = ['management'];
        this.info = 'Commands to manage and configure your server';
    }

    _debug(channel, guildConfig) {
        const msgArray = [];
        const infoArray = [];

        // const perms = channel.permissionsOf(this.eris.user.id);

        infoArray.push(`The prefix${guildConfig.prefixes.length > 1 ? 'es' : ''} for this server: ${guildConfig.prefixes.map(p => `\`${p}\``).join(', ')}`);

        return [msgArray, infoArray];
    }

    debugCommand(command, channel, guildConfig) {
        const config = this.bot.config;
        const [msgArray, infoArray] = this._debug(channel, guildConfig);
        const embed = {
            title: `Command "${command.qualName}" debug`,
            color: config.colours.loading,
        };

        if (command.dmEnabled) {
            infoArray.push(`This command can be used in DMs`);
        }
        if (command.alwaysEnabled) {
            infoArray.push(`This command can not be disabled`);
        }

        const checkPerms = config => {
            if (config.allowedRoles && config.allowedRoles.length) {
                const allowedRoles = config.allowedRoles.filter(id => channel.guild.roles.has(id));
                infoArray.push(`This command is allowed for the following roles: ${allowedRoles.map(id => `<@&${id}>`).join('\n')}`);
            }

            if (config.ignoredRoles && config.ignoredRoles.length) {
                const ignoredRoles = config.ignoredRoles.filter(id => channel.guild.roles.has(id));
                infoArray.push(`This command is allowed for the following roles: ${ignoredRoles.map(id => `<@&${id}>`).join('\n')}`);
            }

            if (config.allowedChannels && config.allowedChannels.length) {
                const allowedChannels = config.allowedChannels.filter(id => channel.guild.channels.has(id));
                infoArray.push(`This command is allowed in the following channels: ${allowedChannels.map(id => `<#${id}>`).join('\n')}`);
                if (!allowedChannels.find(id => id === channel.id)) {
                    msgArray.push(`This command is not allowed in the current channel`);
                }
            }

            if (config.ignoredChannels && config.ignoredChannels.length) {
                const ignoredChannels = config.ignoredChannels.filter(id => channel.guild.channels.has(id));
                infoArray.push(`This command is not allowed in the following channels: ${ignoredChannels.map(id => `<#${id}>`).join('\n')}`);
                if (!ignoredChannels.find(id => id === channel.id)) {
                    msgArray.push(`This command is allowed in the current channel`);
                }
            }
        }

        if (guildConfig.commands && guildConfig.commands[command.rootName]) {
            checkPerms(guildConfig.commands[command.rootName]);
        } else if (guildConfig[command.module.dbName]) {
            checkPerms(guildConfig[command.module.dbname]);
        } else {
            checkPerms(guildConfig);
        }

        if (config.commands[command.dbName] && config.commands[command.dbName].disabled) {
            msgArray.push('This command has been disabled globally');
        }

        // if (!guildConfig.commands || typeof guildConfig.commands[command.dbName] === 'undefined') {
        //     infoArray.push('This command hasn\'t been configured for this server yet');
        // }

        if (command.rich && guildConfig.commands[command.dbName] && guildConfig.commands[command.dbName].disabled) {
            msgArray.push('This command is disabled in this server');
        }

        if (command.debug) {
            const debug = command.debug(command, channel, guildConfig);

            msgArray.push(...debug.shift());
            infoArray.push(...debug.shift());
        }

        embed.description = `**Info:**\n${infoArray.join('\n')}\n`;
        embed.description += `**Debug:**\n${msgArray.join('\n') || 'This command seems to be working properly'}`;

        return embed;
    }

    debugModule(module, channel, guildConfig) {
        const config = this.bot.config;
        const [msgArray, infoArray] = this._debug(channel, guildConfig);
        const embed = {
            title: `Module "${module.name}" debug`,
            color: config.colours.loading,
        };

        if (config.modules[module.dbName].disabled) {
            msgArray.push('This module has been disabled globally');
        }

        if (!guildConfig[module.dbName]) {
            infoArray.push('This module hasn\'t been configured for this server yet');
        }

        if (guildConfig[module.dbName] && guildConfig[module.dbName].disabled) {
            msgArray.push('This module is disabled in this server');
        }

        if (module.debug) {
            const debug = module.debug(module, channel, guildConfig);

            msgArray.push(...debug.shift());
            infoArray.push(...debug.shift());
        }

        embed.description = `**Info:**\n${infoArray.join('\n')}\n`;
        embed.description += `**Debug:**\n${msgArray.join('\n') || 'This module seems to be working properly'}`;

        return embed;
    }
}


module.exports = Manager;