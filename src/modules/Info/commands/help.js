const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'help',
    usage: '[*command or module]',
    alwaysEnabled: true,
    dmEnabled: true,
    info: 'Get help regarding a command or module',
    examples: [
        'help prefix',
        'help tag edit',
        'help Info',
    ],
    cooldown: 1500,
    execute: function (ctx) {
        if (!ctx.args.length) {
            return ctx.error('Sorry, this hasn\'t been implemented yet. You can still use this command to get help on modules/commands (if you know them lol)');
        }
        // add a help message later

        const args = ctx.args.filter(({ length }) => length); // remove empty strings
        const str = args.join(' ');

        if (str.toLowerCase() === 'bot') {
            return ctx.error(`To be implemented, sorry.`);
        }

        const module = ctx.bot.modules.get(str);

        if (!module || ((module.private || module.internal) && !ctx.isAdmin)) {
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
                ((command.module.private || command.module.internal) && !ctx.isAdmin)) {
                return ctx.error('No command or module exists by that name');
            }

            const verbose = ctx.moduleConfig ? ctx.moduleConfig.verbose : true;

            const embed = ctx.module.getCommandHelp(command, ctx.prefix, ctx.isAdmin, verbose);

            return ctx.send({ embed });
        }

        const verbose = ctx.moduleConfig ? ctx.moduleConfig.verbose : true;

        const embed = ctx.module.getModuleHelp(module, ctx.prefix, ctx.isAdmin, verbose);

        return ctx.send({ embed });
    }
});