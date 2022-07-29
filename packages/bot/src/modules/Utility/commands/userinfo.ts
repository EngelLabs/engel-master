import * as moment from 'moment';
import type * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import type Utility from '..';

export default new Command<Utility>({
        name: 'userinfo',
        usage: '[user]',
        aliases: [
                'whois',
                'uinfo'
        ],
        examples: [
                'userinfo @timtoy',
                'userinfo 329768023869358081'
        ],
        info: 'Get some useful information about a server member',
        execute: async function (ctx) {
                if (ctx.args.length) {
                        const converter = new Converter(ctx.app);

                        try {
                                var user = await converter.member(ctx.guild, ctx.args[0], true);
                        } catch (err) {
                                return ctx.error(err);
                        }
                } else {
                        if (ctx.message.messageReference?.channelID === ctx.channel.id) {
                                try {
                                        const msg = ctx.channel.messages.get(ctx.message.messageReference.messageID) ||
                                                await ctx.channel.getMessage(ctx.message.messageReference.messageID);

                                        user = msg.member ? msg.member : ctx.member;
                                } catch {
                                        user = ctx.member;
                                }
                        } else {
                                user = ctx.member;
                        }
                }

                if (!user) return ctx.error(`Member \`${ctx.args.join(' ')}\` not found.`);

                const roles = user.roles.map(r => `<@&${r}>`).join(', ') || 'None';

                const embed: eris.EmbedOptions = {
                        color: ctx.config.colours.info,
                        timestamp: new Date().toISOString(),
                        fields: [
                                { name: 'ID', value: user.id, inline: false },
                                { name: 'Account created', value: moment.unix(user.createdAt / 1000).format('llll'), inline: false },
                                { name: 'Joined server', value: moment.unix(user.joinedAt / 1000).format('llll'), inline: false },
                                { name: `Roles: [${user.roles.length}]`, value: roles.length > 1024 ? 'Too many to list.' : roles, inline: false }
                        ],
                        author: { name: `${user.username}#${user.discriminator}`, url: user.avatarURL, icon_url: user.avatarURL },
                        footer: { text: `Requested by: ${ctx.author.username}#${ctx.author.discriminator}`, icon_url: ctx.author.avatarURL },
                        thumbnail: { url: user.avatarURL }
                };

                // TODO: In the future vvvvvvvvvv
                if (ctx.isAdmin /* || ctx.isStaff */) {
                        const role = ctx.isAdmin ? 'developer' : 'staff';

                        embed.description = `<${ctx.config.emojis.staff}> ${ctx.staticConfig.name} ${role}`;
                }

                return ctx.send({ embed });
        }
});
