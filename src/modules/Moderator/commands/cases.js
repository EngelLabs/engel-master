const Command = require('../../../structures/Command');
const ModLog = require('../../../models/ModLog');
const prettyMS = require('pretty-ms');


module.exports = new Command({
    name: 'cases',
    usage: '<user>',
    info: 'View moderation cases for a user',
    aliases: [
        'modlogs',
    ],
    examples: [
        'cases @timtoy',
        'modlogs 338082875394097153',
    ],
    cooldown: 10000,
    requiredArgs: 1,
    execute: async function (ctx) {
        const userId = ctx.bot.converter.userId(ctx.args[0]);

        if (isNaN(userId)) return ctx.error(userId);

        try {
            var modlogs = await ModLog
                .find({ guild: ctx.guildConfig.id, 'user.id': userId })
                .lean()
                .exec();
        } catch (err) {
            return ctx.error(err);
        }

        if (!modlogs.length) return ctx.error('No cases found for that user.');

        const msgArray = modlogs
            .map(m => {
                let ret = 
                `**Case:** ${m.case}
                **Type:** ${m.type}\n`;

                if (m.duration) {
                    const isActive = m.expiry && m.expiry > Date.now() ? 'true' : 'false';
                    ret += `**Duration:** ${prettyMS(m.duration)} (active: ${isActive})\n`;
                }

                if (m.channel) {
                    ret += `**Channel:** ${m.channel.name} (${m.channel.id})\n`;
                }

                ret += `**Moderator:** ${m.mod.name} (${m.mod.id})\n`;
                
                if (m.reason && m.reason.length) {
                    ret += `**Reason:** ${m.reason}\n`;
                }

                return ret;
            });

        const embed = {
            title: `**Cases for ${userId}**`,
            color: ctx.config.colours.success,
            timestamp: new Date().toISOString(),
            description: msgArray.join('\n'),
        };

        return ctx.send({ embed });
    }
})