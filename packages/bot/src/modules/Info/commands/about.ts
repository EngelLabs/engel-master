import * as os from 'os';
import * as prettyMS from 'pretty-ms';
import type * as types from '@engel/types';
import Command from '../../../core/structures/Command';
import type Info from '..';

const roundIfAboveOne = (num: number) => {
        num = Number(num);
        return num >= 1 ? Math.round(num) : num;
};

export default new Command<Info>({
        name: 'about',
        alwaysEnabled: true,
        dmEnabled: true,
        info: 'Get information about the bot',
        aliases: ['stats', 'info'],
        cooldown: 20000,
        execute: async function (ctx) {
                const { redis, eris, utils, staticConfig, config, guild } = ctx;

                const allRawClusterStats = await redis.hgetall(`engel:${staticConfig.client.state}:clusters`);
                let guildCount = 0, userCount = 0, wsEvents = 0, httpEvents = 0;

                for (const rawClusterStats of Object.values(allRawClusterStats)) {
                        const clusterStats: types.ClusterStats = JSON.parse(rawClusterStats);

                        guildCount += clusterStats.guilds;
                        userCount += clusterStats.users;
                        wsEvents += clusterStats.ws;
                        httpEvents += clusterStats.http;
                }

                const loadAvg = os.loadavg().map(i => `${i.toFixed(2)}%`).join(', ');
                const freeMem = os.freemem();
                const usedMem = utils.formatBytes(freeMem);
                const totalMem = utils.formatBytes(os.totalmem());

                const clientConfig = staticConfig.client;

                const embed = {
                        description: [`[Support server](${config.guilds.official.invite} `,
                                '"Very cool server, join it for 10/10 experience ~ timtoy")'].join(''),
                        fields: [
                                { name: 'Developers', value: config.users.developers.map(id => `<@${id}>`).join('\n'), inline: true },
                                { name: 'Guilds', value: guildCount.toString(), inline: true },
                                { name: 'Users', value: userCount.toString(), inline: true },
                                { name: 'Uptime', value: prettyMS(Math.floor(process.uptime()) * 1000), inline: true },
                                { name: 'Load (1m, 5m, 15m)', value: loadAvg, inline: true },
                                { name: 'Memory', value: `${usedMem}/${totalMem}`, inline: true },
                                { name: 'WS Recv', value: `${roundIfAboveOne(wsEvents / 10)}/sec`, inline: true },
                                { name: 'HTTP Req', value: `${roundIfAboveOne(httpEvents / 10)}/sec`, inline: true }
                        ],
                        timestamp: new Date().toISOString(),
                        footer: {
                                text: [
                                        clientConfig.name[0].toUpperCase() + clientConfig.name.slice(1),
                                        staticConfig.client.state,
                                        `v${staticConfig.version}`,
                                        `Cluster ${staticConfig.cluster.id}/${clientConfig.shards}`,
                                        `Shard ${guild ? guild.shard.id : 0}/${clientConfig.shards}`
                                ].join(' | '),
                                url: 'https://bit.ly/36QzBAF',
                                icon_url: eris.user.avatarURL
                        }
                };

                return ctx.send({ embed });
        }
});
