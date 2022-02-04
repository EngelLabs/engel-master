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

                ctx.args.shift();

                while (command?.commands && ctx.args.length) {
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

                if (command.alwaysEnabled) {
                        return ctx.error("That command can't be disabled.");
                }

                let enabled;
                let update;

                const name = command.parent ? command.dbName : command.name;

                const commands = ctx.guildConfig.commands = ctx.guildConfig.commands || {};

                if (command.parent) {
                        commands[name] = commands.hasOwnProperty(name) ? !commands[name] : false;

                        enabled = commands[name];

                        update = { ['commands.' + name]: commands[name] };
                } else {
                        const commandConfig = commands[name] = commands[name] || {};

                        commandConfig.disabled = !commandConfig.disabled;

                        enabled = !commandConfig.disabled;

                        update = { ['commands.' + name + '.disabled']: commandConfig.disabled };
                }

                ctx.bot.guilds.update(ctx.guildConfig, { $set: update });

                return ctx.success(enabled
                        ? `Command \`${command.qualName}\` enabled.`
                        : `Command \`${command.qualName}\` disabled.`
                );
        }
});