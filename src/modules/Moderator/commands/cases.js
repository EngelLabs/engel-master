const Command = require('../../../core/structures/Command');


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
                const userID = ctx.helpers.converter.userID(ctx.args[0]);

                if (isNaN(userID)) return ctx.error(userID);

                let modlogs;

                try {
                        modlogs = await ctx.models.ModLog
                                .find({ guild: ctx.guildConfig.id, 'user.id': userID })
                                .lean();
                } catch (err) {
                        return ctx.error(err);
                }

                if (!modlogs.length) return ctx.error('No cases found for that user.');

                const moderation = ctx.helpers.moderation;

                modlogs = modlogs
                        .map(m => moderation.formatModlog(m, false))
                        .join('\n');

                // TODO: allow channel modlogs (also remove channellogs command)
                // TODO: implement pagination for this command

                const embed = {
                        title: `**Cases for ${userID}**`,
                        description: modlogs,
                        color: ctx.config.colours.success,
                        timestamp: new Date().toISOString(),
                };

                return ctx.send({ embed });
        }
})