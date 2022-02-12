const { Command } = require('@timbot/core');
const prettyMS = require('pretty-ms');


const giveaway = new Command({
        name: 'giveaway',
        info: 'Commands to manage server giveaways',
        aliases: [
                'gw',
                'ga',
        ],
        examples: [],
        requiredPermissions: ['embedLinks'],
        execute: async function (ctx) {
                const _ = str => `${ctx.author.mention}, ${str}`;

                const check = msg => {
                        return (
                                msg.channel.id === ctx.channel.id &&
                                msg.author.id === ctx.author.id
                        );
                }

                const exchange = async toSend => {
                        try {
                                if (!await ctx.send(toSend)) return false;
                        } catch {
                                return false;
                        }

                        let msg;

                        try {
                                msg = await ctx.waitFor('messageCreate', check, 30000);
                        } catch (err) {
                                ctx.send(_('Giveaway creation timed out.'));
                                return false;
                        }

                        if (msg.content === 'cancel') {
                                ctx.send(_('Giveaway creation canceled.'));
                                return false;
                        }

                        return msg;
                }

                let msg;
                let text;

                msg = await exchange(_('What is the giveaway\'s title? You can send \`~\` to not include one.'));
                if (!msg) return;

                const title = msg.content !== '~' ? msg.content : null;



                if (title !== null) {
                        text = `Alright, the title is \`${title}\``;
                } else {
                        text = 'No title given.';
                }

                text += '\nWhat is the giveaway\'s description? You can send `~` to not include one.';

                msg = await exchange(_(text));
                if (!msg) return;

                const info = msg.content !== '~' ? msg.content : null;

                if (info !== null) {
                        text = `Sweet, the description is \`${info}\``
                } else {
                        text = 'No description given.';
                }

                text += '\nWhat are you actually giving away?';

                msg = await exchange(_(text));
                if (!msg) return;

                const item = msg.content;

                msg = await exchange(_(`You're giving away \`${item}\`\nHow many winners will this giveaway have?`));

                let winnerCount;

                while (isNaN(winnerCount) || winnerCount < 1 || winnerCount > 50) {
                        if (!msg) return;

                        winnerCount = parseInt(msg.content.split(' ')[0], 10);

                        if (isNaN(winnerCount) || winnerCount < 1 || winnerCount > 50) {
                                msg = await exchange(_(`That is an invalid value. Try a number between 1-50`));
                        }
                }

                msg = await exchange(_(`There are \`${winnerCount}\` winners for this giveaway\nWhere is this giveaway hosted? (you can mention the channel or provide the ID)`));

                let channel;

                while (!channel) {
                        if (!msg) return;

                        const arg = msg.content.split(' ')[0];

                        try {
                                channel = await ctx.helpers.converter.textChannel(ctx.guild, arg);

                                if (!channel) {
                                        msg = await exchange(_(`Channel \`${arg}\` not found, please try again.`));
                                }
                        } catch (err) {
                                msg = await exchange(_(err));
                        }
                }

                msg = await exchange(_(`Alright, the giveaway will be hosted in ${channel.mention}\nHow long will the giveaway last?`));

                let duration;

                while (!duration) {
                        if (!msg) return;

                        const arg = msg.content.split(' ')[0];

                        duration = ctx.helpers.converter.duration(arg);

                        if (!duration) {
                                msg = await exchange(_(`Duration \`${arg}\` is invalid, please try again.`));
                        }

                        if (duration < 300) {
                                msg = await exchange(_('Duration must be at least 5 minutes.'));
                        }
                }

                const embed = {};

                if (title) embed.title = title;
                if (info) embed.description = info;

                msg = await exchange(
                        {
                                content: `${ctx.author.mention}, Sweet, this giveaway will last for ${prettyMS(duration * 1000, { verbose: true })}
            Type \`confirm\` to initiate the giveaway. The embed will look like the one below.`,
                                embed: embed,
                        }
                );

                if (!msg) return;
        }
});


module.exports = giveaway;