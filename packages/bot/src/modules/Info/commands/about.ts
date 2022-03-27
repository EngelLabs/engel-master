import * as os from 'os';
import * as prettyMS from 'pretty-ms';
import Command from '../../../core/structures/Command';
import type Info from '..';

const roundIfWhole = (num: number) => {
        num = Number(num);

        return num >= 1 ? Math.round(num) : num;
};

const reduce = (err: Error | null, data: { [key: string]: string }) => {
        if (err) {
                throw err;
        }

        return Object.values(data).reduce((prev, curr) => Number(curr) + prev, 0);
};

export default new Command<Info>({
        name: 'about',
        alwaysEnabled: true,
        dmEnabled: true,
        info: 'Get information about the bot',
        aliases: ['stats', 'info'],
        cooldown: 20000,
        execute: async function (ctx) {
                const owner = ctx.eris.users.get(ctx.config.author.id);

                if (!owner) return ctx.addErrorReaction();

                const [events, guildCounts, memberCounts, userCounts] = await ctx.redis.multi()
                        .hgetall('engel:events')
                        .hgetall('engel:guilds')
                        .hgetall('engel:members')
                        .hgetall('engel:users')
                        .exec();

                const loadAvg = os.loadavg().join(', ');

                const embed = {
                        description: `[Support server](${ctx.config.guilds.official.invite} "Very cool server, join it for 10/10 experience ~ timtoy")`,
                        fields: [
                                { name: 'Owner', value: owner.mention, inline: true },
                                { name: 'Guilds', value: reduce(...guildCounts).toString(), inline: true },
                                { name: 'Members', value: reduce(...memberCounts).toString(), inline: true },
                                { name: 'Users', value: reduce(...userCounts).toString(), inline: true },
                                { name: 'WS Recv', value: `${roundIfWhole(events[1].ws / 20)}/sec`, inline: true },
                                { name: 'HTTP', value: `${roundIfWhole(events[1].http / 20)}/sec`, inline: true },
                                { name: 'Uptime', value: prettyMS(Math.floor(process.uptime()) * 1000), inline: true },
                                { name: 'Load (1m, 5m, 15m)', value: loadAvg, inline: true }
                        ],
                        author: {
                                name: `${ctx.baseConfig.client.name}[${ctx.baseConfig.client.state}, v${ctx.baseConfig.version}]`,
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
