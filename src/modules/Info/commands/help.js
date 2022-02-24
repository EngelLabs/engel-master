const { Command } = require('@engel/core');


module.exports = new Command({
        name: 'help',
        usage: '[*command or module]',
        alwaysEnabled: true,
        dmEnabled: true,
        info: 'Get help for a command or module',
        examples: [
                'help prefix',
                'help ban',
                'help utility',
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
                                'Not implemented yet, sorry!',
                        ];
                        const me = ctx.me;
                        const embed = {
                                title: 'Core Help',
                                description: msgArray.join('\n'),
                                author: {
                                        name: `${me.username}#${me.discriminator}`,
                                        url: me.avatarURL,
                                        icon_url: me.avatarURL,
                                },
                        }

                        return ctx.send({ embed });
                }

                let command = ctx.core.commands.get(ctx.args.shift());

                while (command?.commands && ctx.args.length) {
                        const subcommand = command.commands.get(ctx.args[0]);

                        /*
                        if (!subcommand) return ctx.error(`Command "${command.qualName}" has no subcommand "${args[0]}"`);
                        */

                        if (!subcommand) break;

                        command = subcommand;
                        ctx.args.shift();
                }

                if (!command || ((command.module.private || command.module.internal || command.module.disabled) && !ctx.isAdmin)) {
                        const module = ctx.core.modules.get(str);

                        if (!module || ((module.private || module.internal || module.disabled) && !ctx.isAdmin)) {
                                return ctx.error('No command or module exists by that name.');
                        }

                        const verbose = ctx.moduleConfig ? !ctx.moduleConfig.noVerbose : true;

                        const embed = ctx.module.getModuleHelp(module, ctx.prefix, ctx.isAdmin, verbose);

                        return ctx.send({ embed });
                }

                const verbose = ctx.moduleConfig ? !ctx.moduleConfig.noVerbose : true;

                const embed = ctx.module.getCommandHelp(command, ctx.prefix, ctx.isAdmin, verbose);

                return ctx.send({ embed });
        }
});