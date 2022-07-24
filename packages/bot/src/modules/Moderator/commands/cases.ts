import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import Moderation from '../../../core/helpers/Moderation';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'cases',
        usage: '<user>',
        info: 'View moderation cases for a user or channel',
        aliases: [
                'modlogs'
        ],
        examples: [
                'cases @timtoy',
                'cases 932117428496904283',
                'modlogs 338082875394097153'
        ],
        cooldown: 10000,
        requiredArgs: 1,
        execute: async function (ctx) {
                const converter = new Converter(ctx.app);

                let id = converter.userID(ctx.args[0]);

                if (isNaN(parseInt(id))) {
                        id = converter.channelID(ctx.args[0]);

                        if (isNaN(parseInt(id))) {
                                return ctx.error(`Channel/User \`${ctx.args[0]}\` is invalid.`);
                        }
                }

                try {
                        var modlogs = await ctx.mongo.modlogs
                                .find({ guild: ctx.guild.id, $or: [{ 'user.id': id }, { 'channel.id': id }] })
                                .toArray();
                } catch (err) {
                        return ctx.error(err);
                }

                if (!modlogs.length) {
                        return ctx.error('No cases found for that channel/user.');
                }

                const moderation = new Moderation(ctx.app);

                const msg = modlogs
                        .map(m => {
                                // Don't include user ID
                                if (m.user?.id === id) {
                                        return moderation.formatModlog(m, false, true);
                                }

                                // Don't include channel ID
                                return moderation.formatModlog(m, true, false);
                        })
                        .join('\n');

                // TODO: implement pagination for this command

                const embed = {
                        title: `**Cases for ${id}**`,
                        description: msg,
                        color: ctx.config.colours.success
                };

                return ctx.send({ embed });
        }
});
