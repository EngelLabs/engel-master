const { Command } = require('@timbot/core');


module.exports = new Command({
        name: 'avatar',
        usage: '[member]',
        aliases: ['av'],
        examples: [
                'avatar',
                'avatar @timtoy',
        ],
        info: 'View a server member\'s avatar',
        dmEnabled: true,
        execute: async function (ctx) {
                let user;

                if (ctx.args.length) {
                        try {
                                user = await ctx.helpers.converter.user(ctx.args[0], true);
                        } catch (err) {
                                return ctx.error(err);
                        }

                        if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);
                } else {
                        if (ctx.message.messageReference?.channelID === ctx.channel.id) {
                                try {
                                        const msg = (
                                                ctx.channel.messages.get(ctx.message.messageReference.messageID) ||
                                                await ctx.channel.getMessage(ctx.message.messageReference.messageID)
                                        );

                                        user = msg.author || ctx.author;
                                } catch {
                                        user = ctx.author;
                                }
                        } else {
                                user = ctx.author;
                        }
                }

                const format = user.avatar?.startsWith?.('a_')
                        ? 'gif'
                        : 'png';

                const avURL = user.dynamicAvatarURL(format, 4096);

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