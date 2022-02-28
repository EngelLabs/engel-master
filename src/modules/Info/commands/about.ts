import * as prettyMS from 'pretty-ms';
import Command from '../../../core/structures/Command';
import Info from '..';

export default new Command<Info>({
        name: 'about',
        alwaysEnabled: true,
        dmEnabled: true,
        info: 'Get information about the core',
        cooldown: 20000,
        execute: function (ctx) {
                const owner = ctx.eris.users.get(ctx.config.author.id);

                if (!owner) return ctx.addErrorReaction();

                const embed = {
                        description: `[Support server](${ctx.config.guilds.official.invite} "Very cool server, join it")`,
                        fields: [
                                { name: 'Owner', value: owner.mention, inline: true },
                                { name: 'Guilds', value: ctx.eris.guilds.size.toString(), inline: true },
                                { name: 'Users', value: ctx.eris.users.size.toString(), inline: true },
                                { name: 'Events', value: '...', inline: true },
                                { name: 'Uptime', value: prettyMS(Math.floor(process.uptime()) * 1000), inline: true },
                                { name: 'Process', value: `PID: ${process.pid}`, inline: true } // TODO: add more info here
                        ],
                        author: {
                                name: `${ctx.baseConfig.name}[${ctx.baseConfig.client.name}] v${ctx.baseConfig.version}`,
                                url: ctx.eris.user.avatarURL
                        },
                        timestamp: new Date().toISOString(),
                        footer: {
                                text: `Built with ${ctx.baseConfig.lib}`
                        }
                };

                return ctx.send({ embed });
        }
});
