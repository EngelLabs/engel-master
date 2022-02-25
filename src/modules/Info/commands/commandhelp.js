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
        execute: function (ctx) {
                const verbose = ctx.moduleConfig ? !ctx.moduleConfig.noVerbose : true;

                const embed = ctx.core.commands.help(ctx.args.join(' '), ctx.prefix, ctx.isAdmin, verbose);

                if (!embed) {
                        return ctx.error('No command exists by that name.');
                }

                return ctx.send({ embed });
        }
})