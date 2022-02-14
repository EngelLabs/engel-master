const { Command } = require('@timbot/core');


module.exports = new Command({
        name: 'cases',
        usage: '<user>',
        info: 'View moderation cases for a user or channel',
        aliases: [
                'modlogs',
        ],
        examples: [
                'cases @timtoy',
                'cases 932117428496904283',
                'modlogs 338082875394097153',
        ],
        cooldown: 10000,
        requiredArgs: 1,
        execute: async function (ctx) {
                let id = ctx.helpers.converter.userID(ctx.args[0]);

                if (isNaN(id)) {
                        id = ctx.helpers.converter.channelID(ctx.args[0]);

                        if (isNaN(id)) {
                                return ctx.error(`Channel/User \`${ctx.args[0]}\` is invalid.`);
                        }
                }

                let modlogs;

                try {
                        modlogs = await ctx.models.ModLog
                                .find({ guild: ctx.guild.id, $or: [ { 'user.id': id }, { 'channel.id': id }] })
                                .lean();
                } catch (err) {
                        return ctx.error(err);
                }

                if (!modlogs.length) {
                        return ctx.error('No cases found for that channel/user.');
                }

                const moderation = ctx.helpers.moderation;

                modlogs = modlogs
                        .map(m => moderation.formatModlog(m, false))
                        .join('\n');

                // TODO: implement pagination for this command

                const embed = {
                        title: `**Cases for ${id}**`,
                        description: modlogs,
                        color: ctx.config.colours.success,
                };

                return ctx.send({ embed });
        }
})