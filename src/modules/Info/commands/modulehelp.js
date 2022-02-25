const { Command } = require('@engel/core');


module.exports = new Command({
        name: 'modulehelp',
        usage: '<*module>',
        aliases: ['mhelp'],
        info: 'Get help for a module',
        examples: [
                'help mod',
                'help automoderator',
                'help cc',
        ],
        requiredArgs: 1,
        cooldown: 1500,
        execute: function (ctx) {
                const verbose = ctx.moduleConfig ? !ctx.moduleConfig.noVerbose : true;

                const embed = ctx.core.modules.help(ctx.args.join(' '), ctx.prefix, ctx.isAdmin, verbose);

                if (!embed) {
                        return ctx.error('No module exists by that name.');
                }

                return ctx.send({ embed });
        }
});