"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const prettyMS = require("pretty-ms");
const Command_1 = require("../../../core/structures/Command");
const roundIfWhole = (num) => {
    num = Number(num);
    return num >= 1 ? Math.round(num) : num;
};
exports.default = new Command_1.default({
    name: 'about',
    alwaysEnabled: true,
    dmEnabled: true,
    info: 'Get information about the bot',
    aliases: ['stats', 'info'],
    cooldown: 20000,
    execute: async function (ctx) {
        const owner = ctx.eris.users.get(ctx.config.author.id);
        if (!owner)
            return ctx.addErrorReaction();
        const allClusterStats = await ctx.redis.hgetall('engel:clusters');
        let guildCount = 0, memberCount = 0, userCount = 0, wsEvents = 0, httpEvents = 0;
        for (const rawClusterStats of Object.values(allClusterStats)) {
            const clusterStats = JSON.parse(rawClusterStats);
            guildCount += clusterStats.guilds;
            memberCount += clusterStats.members;
            userCount += clusterStats.userCount;
            wsEvents += clusterStats.ws;
            httpEvents += clusterStats.http;
        }
        const loadAvg = os.loadavg().map(i => i.toFixed(2)).join(', ');
        const embed = {
            description: `[Support server](${ctx.config.guilds.official.invite} "Very cool server, join it for 10/10 experience ~ timtoy")`,
            fields: [
                { name: 'Owner', value: owner.mention, inline: true },
                { name: 'Guilds', value: guildCount.toString(), inline: true },
                { name: 'Members', value: memberCount.toString(), inline: true },
                { name: 'Users', value: userCount.toString(), inline: true },
                { name: 'Uptime', value: prettyMS(Math.floor(process.uptime()) * 1000), inline: true },
                { name: 'Load (1m, 5m, 15m)', value: loadAvg, inline: true },
                { name: 'WS Recv', value: `${roundIfWhole(wsEvents / 10)}/sec`, inline: true },
                { name: 'HTTP', value: `${roundIfWhole(httpEvents / 10)}/sec`, inline: true }
            ],
            author: {
                name: `${ctx.baseConfig.client.name}[${ctx.baseConfig.client.state}, v${ctx.baseConfig.version}]`,
                url: 'https://bit.ly/36QzBAF',
                icon_url: ctx.eris.user.avatarURL
            },
            timestamp: new Date().toISOString(),
            footer: {
                text: `Cluster ${ctx.baseConfig.cluster.id} | Shard ${ctx.guild?.shard?.id ?? 0}`
            }
        };
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=about.js.map