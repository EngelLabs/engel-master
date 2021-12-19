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
    execute: function ({
        bot,
        guildConfig,
        args,
        success,
        error
    }) {
        let command = bot.commands.get(args[0]);

        if (!command || command.hidden || command.module.private || command.module.internal) {
            return error(`Command \`${args[0]}\` not found.`);
        }

        args.shift();

        while (command && command.commands && args.length) {
            const subcommand = command.commands.get(args[0]);

            if (!subcommand) {
                return error(`Command \`${command.qualName}\` has no subcommand \`${args[0]}\``);
            }

            args.shift();
            command = subcommand;
        }

        if (!command || command.hidden || command.module.private || command.module.internal) {
            return error(`Command \`${args[0]}\` not found.`);
        }

        if (command.alwaysEnabled) return error('That command can\'t be disabled.');

        const commandName = command.dbName;
        let toggle;

        guildConfig.commands = guildConfig.commands || {};

        if (!command.rich) {
            toggle = typeof guildConfig.commands[commandName] !== 'undefined' ? !guildConfig.commands[commandName] : false;
            guildConfig.commands[commandName] = toggle;
        } else {
            const commandConfig = guildConfig.commands[commandName] = guildConfig.commands[commandName] || {};
            toggle = commandConfig.disabled = !commandConfig.disabled;
        }

        queryString = 'commands.' + commandName;

        if (command.rich) {
            queryString += '.disabled';
        }

        bot.guilds.update(guildConfig.id, {
            $set: {
                [queryString]: toggle
            }
        });

        console.log(toggle);

        return success(toggle
            ? `Command \`${command.qualName}\` disabled.`
            : `Command \`${command.qualName}\` enabled.`
        );
    }
});