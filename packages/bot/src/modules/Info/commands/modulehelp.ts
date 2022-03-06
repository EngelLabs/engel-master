import Command from '../../../core/structures/Command';
import type Info from '..';

export default new Command<Info>({
        name: 'modulehelp',
        usage: '<*module>',
        aliases: ['mhelp'],
        info: 'Get help for a module',
        examples: [
                'help mod',
                'help automoderator',
                'help cc'
        ],
        requiredArgs: 1,
        cooldown: 1500,
        execute: function (ctx) {
                const verbose = ctx.guildConfig.verboseHelp !== undefined ? ctx.guildConfig.verboseHelp : true;

                const embed = ctx.core.modules.help(ctx.args.join(' '), ctx.prefix, ctx.isAdmin, verbose);

                if (!embed) {
                        return ctx.error('No module exists by that name.');
                }

                return ctx.send({ embed });
        }
});
