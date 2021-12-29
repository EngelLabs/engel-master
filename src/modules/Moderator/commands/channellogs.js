const Command = require('../../../core/structures/Command');
const prettyMS = require('pretty-ms');


// NOTE: consider merging this into "modlogs"
module.exports = new Command({
    name: 'channellogs',
    usage: '<channel>',
    aliases: [
        'clogs',
    ],
    info: 'View moderation cases for a channel',
    cooldown: 10000,
    requiredArgs: 1,
    execute: async function (ctx) {
        let channelId;

        try {
            channelId = ctx.bot.helpers.converter.channelId(ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (isNaN(channelId)) return ctx.error(channelId);

        const modlogs = await ctx.models.ModLog
            .find({ guild: ctx.guild.id, 'channel.id': channelId })
            .lean()
            .exec();

        if (!modlogs || !modlogs.length) {
            return ctx.error(`No cases found for that channel.`);
        }

        const msgArray = modlogs
            .map(m => {
                let ret = `**Case:** ${m.case}\n**Type:** ${m.type}\n`;

                if (typeof m.count !== 'undefined') {
                    ret += `**Count:** ${m.count}\n`;
                }

                if (m.duration) {
                    const isActive = m.expiry && m.expiry > Date.now() ? 'true' : 'false';
                    ret += `**Duration:** ${prettyMS(m.duration)} (active: ${isActive})\n`;
                }

                if (m.user) {
                    ret += `**User:** ${m.user.name} (${m.user.id})\n`;
                }

                ret += `**Moderator:** ${m.mod.name} (${m.mod.id})\n`;

                if (m.reason && m.reason.length) {
                    ret += `**Reason:** ${m.reason}\n`;
                }

                return ret;
            });

        const embed = {
            title: `**Cases for ${channelId}**`,
            color: ctx.config.colours.success,
            timestamp: new Date().toISOString(),
            description: msgArray.join('\n'),
        };

        return ctx.send({ embed });
    }
});