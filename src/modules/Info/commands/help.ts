import Command from '../../../core/structures/Command';
import Info from '..';

export default new Command<Info>({
        name: 'help',
        usage: '[*command or module]',
        alwaysEnabled: true,
        dmEnabled: true,
        info: 'Get help for a command or module',
        examples: [
                'help prefix',
                'help ban',
                'help utility'
        ],
        cooldown: 1500,
        execute: function (ctx) {
                if (!ctx.args.length) {
                        return ctx.error('Sorry, this hasn\'t been implemented yet. You can still use this command to get help on modules/commands (if you know them lol)');
                }
                // add a help message later

                const str = ctx.args.join(' ');

                if (str.toLowerCase() === 'core') {
                        const msgArray = [
                                'Not implemented yet, sorry!'
                        ];
                        const me = ctx.me;
                        const embed = {
                                title: 'Core Help',
                                description: msgArray.join('\n'),
                                author: {
                                        name: `${me.username}#${me.discriminator}`,
                                        url: me.avatarURL,
                                        icon_url: me.avatarURL
                                }
                        };

                        return ctx.send({ embed });
                }

                const verbose = ctx.guildConfig.verboseHelp !== undefined ? ctx.guildConfig.verboseHelp : true;

                const embed = (
                        ctx.core.commands.help(str, ctx.prefix, ctx.isAdmin, verbose) ||
                        ctx.core.modules.help(str, ctx.prefix, ctx.isAdmin, verbose)
                );

                if (!embed) {
                        return ctx.error('No command or module exists by that name.');
                }

                return ctx.send({ embed });
        }
});
