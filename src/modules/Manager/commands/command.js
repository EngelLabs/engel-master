const Command = require('../../../core/structures/Command');


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
        execute: function (ctx) {
                let command = ctx.bot.commands.get(ctx.args[0]);

                if (!command || command.hidden || command.module.private || command.module.internal || command.module.disabled) {
                        return ctx.error(`Command \`${ctx.args[0]}\` not found.`);
                }

                ctx.args.shift();

                while (command && command.commands && ctx.args.length) {
                        const subcommand = command.commands.get(ctx.args[0]);

                        if (!subcommand) {
                                return ctx.error(`Command \`${command.qualName}\` has no subcommand \`${ctx.args[0]}\``);
                        }

                        ctx.args.shift();
                        command = subcommand;
                }

                if (!command || command.hidden || command.module.private || command.module.internal || command.module.disabled) {
                        return ctx.error(`Command \`${ctx.args[0]}\` not found.`);
                }

                if (command.alwaysEnabled) return ctx.error('That command can\'t be disabled.');

                const commandName = command.dbName;
                let toggle;

                ctx.guildConfig.commands = ctx.guildConfig.commands || {};

                if (!command.parent) {
                        toggle = ctx.guildConfig.commands[commandName] !== undefined ? !ctx.guildConfig.commands[commandName] : false;
                        ctx.guildConfig.commands[commandName] = toggle;
                } else {
                        const commandConfig = ctx.guildConfig.commands[commandName] = ctx.guildConfig.commands[commandName] || {};
                        toggle = commandConfig.disabled = !commandConfig.disabled;
                }

                queryString = 'commands.' + commandName;

                if (command.parent) {
                        queryString += '.disabled';
                }

                ctx.bot.guilds.update(ctx.guildConfig.id, {
                        $set: {
                                [queryString]: toggle
                        }
                });

                return ctx.success(toggle
                        ? `Command \`${command.qualName}\` disabled.`
                        : `Command \`${command.qualName}\` enabled.`
                );
        }
});