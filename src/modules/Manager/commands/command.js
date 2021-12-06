const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'command',
    usage: '<*command>',
    info: 'Enable or disable a command',
    examples: [
        'command giveaway',
        'command prefix set',
    ],
    cooldown: 3000,
    requiredArgs: 1,
    alwaysEnabled: true,
    execute: async function ({
        bot,
        guildConfig,
        isAdmin,
        args,
        success,
        error
    }) {
        let command = bot.commands.get(args[0]);

        args.shift();
        const module = command.module;

        while (command.commands && args.length) {
            const subcommand = command.commands.get(args[0].toLowerCase());

            if (!subcommand) {
                return error(`Command \`${command.qualName}\` has no subcommand \`${args[0]}\``);
            }

            args.shift();
            command = subcommand;
        }

        if (!command || ((command.hidden || module.private || module.internal) && !isAdmin)) {
            return error(`Command \`${args[0]}\` not found.`);
        }

        if (command.alwaysEnabled) return error('That command can\'t be disabled.');

        const isSubcommand = typeof command.parent !== 'undefined';
        const commandName = command.dbName;
        let toggle;

        guildConfig.commands = guildConfig.commands || {};

        if (isSubcommand) {
            toggle = typeof guildConfig.commands[commandName] !== 'undefined' ? !guildConfig.commands[commandName] : false;
            guildConfig.commands[commandName] = toggle;
        } else {
            const commandConfig = guildConfig.commands[commandName] = guildConfig.commands[commandName] || {};
            toggle = commandConfig.enabled = typeof commandConfig.enabled !== 'undefined' ? !commandConfig.enabled : false;
        }

        queryString = 'commands.' + commandName;

        if (!isSubcommand) {
            queryString += '.enabled';
        }

        await bot.guilds.update(guildConfig.id, {
            $set: {
                [queryString]: toggle
            }
        });

        return success(toggle ?
            `Command \`${command.qualName}\` enabled.` :
            `Command \`${command.qualName}\` disabled.`
        );
    }
});