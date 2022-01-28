const prettyMS = require('pretty-ms');
const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'about',
        alwaysEnabled: true,
        dmEnabled: true,
        info: 'Get information about the bot',
        cooldown: 20000,
        execute: function (ctx) {
                const owner = ctx.eris.users.get(ctx.config.author.id);

                if (!owner) return ctx.addErrorReaction();

                const embed = {
                        description: `[Support server](${ctx.config.guilds.official.invite} "Very cool server, join it")`,
                        fields: [
                                { name: 'Owner', value: owner.mention, inline: true },
                                { name: 'Guilds', value: ctx.eris.guilds.size, inline: true },
                                { name: 'Users', value: ctx.eris.users.size, inline: true },
                                { name: 'Events', value: '...', inline: true },
                                { name: 'Uptime', value: prettyMS(Math.floor(process.uptime()) * 1000), inline: true },
                                { name: 'Process', value: `PID: ${process.pid}`, inline: true }, // TODO: add more info here
                        ],
                        author: {
                                name: `${ctx.baseConfig.name} v${ctx.baseConfig.version}`,
                                url: ctx.eris.user.avatarURL,
                        },
                        timestamp: new Date().toISOString(),
                        footer: {
                                text: `Built with ${ctx.baseConfig.lib}`
                        }
                };

                return ctx.send({ embed });
        },
});