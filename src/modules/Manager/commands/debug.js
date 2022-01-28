const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'debug',
        usage: '<*command or module>',
        info: 'Debug a command or module',
        requiredArgs: 1,
        alwaysEnabled: true,
        execute: async function (ctx) {
                const args = ctx.args.filter(({ length }) => length);
                const str = args.join(' ');

                const module = ctx.bot.modules.get(str.charAt(0).toUpperCase() + str.slice(1));

                if (!module || ((module.private || module.internal || module.disabled) && !ctx.isAdmin)) {
                        let command = ctx.bot.commands.get(args[0]);

                        if (!command) return ctx.error('No command or module exists by that name');

                        args.shift();

                        while (command.commands && args.length) {
                                const subcommand = command.commands.get(args[0]);

                                // if (!subcommand) return ctx.error(`Command "${command.qualName}" has no subcommand "${args[0]}"`);
                                if (!subcommand) break;

                                args.shift();
                                command = subcommand;
                        }

                        if ((command.hidden && !ctx.isAdmin) ||
                                ((command.module.private || command.module.internal || command.module.disabled) && !ctx.isAdmin)) {
                                return ctx.error('No command or module exists by that name');
                        }

                        const embed = ctx.module.debugCommand(command, ctx.channel, ctx.guildConfig);

                        return ctx.send({ embed });
                }

                const embed = ctx.module.debugModule(module, ctx.channel, ctx.guildConfig);

                return ctx.send({ embed });
        }
});