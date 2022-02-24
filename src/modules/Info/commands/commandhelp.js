const { Command } = require('@engel/core');


module.exports = new Command({
        name: 'commandhelp',
        usage: '<*command>',
        aliases: ['chelp'],
        info: 'Get help for a command',
        examples: [
                'help cc',
                'help ban',
                'help muterole set',
        ],
        requiredArgs: 1,
        cooldown: 1500,
        execute: async function (ctx) {
                let command = ctx.bot.commands.get(ctx.args[0]);

                if (!command) return ctx.error('No command or exists by that name');

                ctx.args.shift();

                while (command.commands && ctx.args.length) {
                        const subcommand = command.commands.get(ctx.args[0]);

                        /*
                        if (!subcommand) {
                            return ctx.error(`Command "${command.qualName}" has no subcommand "${ctx.args[0]}"`);
                        }
                        */
                        if (!subcommand) break;

                        ctx.args.shift();
                        command = subcommand;
                }

                if ((command.hidden && !ctx.isAdmin) ||
                        ((command.module.private || command.module.internal || command.module.disabled) && !ctx.isAdmin)) {
                        return ctx.error('No command exists by that name');
                }

                const verbose = ctx.moduleConfig ? !ctx.moduleConfig.noVerbose : true;

                const embed = ctx.module.getCommandHelp(command, ctx.prefix, ctx.isAdmin, verbose);

                return ctx.send({ embed });
        }
})