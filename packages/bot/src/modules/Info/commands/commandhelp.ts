import Command from '../../../core/structures/Command';
import type Info from '..';

export default new Command<Info>({
        name: 'commandhelp',
        usage: '<*command>',
        aliases: ['chelp'],
        info: 'Get help for a command',
        examples: [
                'help cc',
                'help ban',
                'help muterole set'
        ],
        requiredArgs: 1,
        cooldown: 1500,
        execute: function (ctx) {
                const verbose = ctx.guildConfig.verboseHelp !== undefined ? ctx.guildConfig.verboseHelp : true;
                
                const text = ctx.args.join(' ');

                const embed = ctx.core.commands.help(text, ctx.prefix, ctx.isAdmin, verbose);

                if (!embed) {
                        return ctx.error(`Command \`${text}\` not found.`);
                }

                return ctx.send({ embed });
        }
});
