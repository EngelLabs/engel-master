const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'avatar',
        usage: '[member]',
        aliases: ['av'],
        examples: [
                'avatar',
                'avatar @timtoy',
        ],
        info: 'View a server member\'s avatar',
        execute: async function (ctx) {
                let user;

                if (ctx.args.length) {
                        try {
                                user = await ctx.helpers.converter.member(ctx, ctx.args[0]);
                        } catch (err) {
                                return ctx.error(err);
                        }

                        if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);
                } else {
                        if (ctx.message.messageReference
                                && ctx.message.messageReference.messageID
                                && ctx.message.messageReference.channelID === ctx.channel.id) {
                                try {
                                        const msg = (
                                                ctx.channel.messages.get(ctx.message.messageReference.messageID) ||
                                                await ctx.channel.getMessage(ctx.message.messageReference.messageID)
                                        );

                                        user = msg.member ? msg.member : ctx.member;
                                } catch {
                                        user = ctx.member;
                                }
                        } else {
                                user = ctx.member;
                        }
                }

                const avURL = (user.user || user).dynamicAvatarURL(null, 1024);

                const embed = {
                        description: `[${user.username}#${user.discriminator}'s avatar](${avURL} "Not a rick roll")`,
                        image: { url: avURL },
                        footer: {
                                text: `Requested by ${ctx.author.username}#${ctx.author.discriminator}`,
                                icon_url: ctx.author.dynamicAvatarURL(null, 64),
                        },
                };

                return ctx.send({ embed });
        }
});