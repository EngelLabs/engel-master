const Command = require('../../../core/structures/Command');


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
        execute: async function (ctx) {
                const module = ctx.bot.modules.get(ctx.args.join(' '));

                if (!module || ((module.private || module.internal || module.disabled) && !ctx.isAdmin)) {
                        return ctx.error('No module exists by that name.');
                }

                const verbose = ctx.moduleConfig ? !ctx.moduleConfig.noVerbose : true;

                const embed = ctx.module.getModuleHelp(module, ctx.prefix, ctx.isAdmin, verbose);

                return ctx.send({ embed });
        }
});