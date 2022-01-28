const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'clean',
        usage: '[count=100]',
        info: 'Clean up messages sent by the bot',
        aliases: [
                'cleanup',
        ],
        examples: [
                'clean 200',
        ],
        cooldown: 4000,
        requiredPermissions: ['readMessageHistory'],
        execute: async function (ctx) {
                let count = parseInt(ctx.args[0] || 100, 10);

                if (isNaN(count) || count <= 0 || count > 500) {
                        return ctx.error(`Count \`${ctx.args[0]}\` is invalid.`);
                }

                ctx.addLoadingReaction().catch(() => false);

                const { eris, channel } = ctx;

                let messages = await ctx.eris.getMessages(channel.id, { limit: count, before: ctx.message.id });

                messages = messages
                        .filter(msg => {
                                if (msg.author.id !== eris.user.id) return false;
                                if (msg.pinned) return false;

                                if (msg.timestamp && (Date.now() - msg.timestamp) > (1000 * 60 * 60 * 24 * 14)) return false;

                                return true;
                        })
                        .map(m => m.id);

                if (!messages || !messages.length) {
                        return ctx.removeLoadingReaction().catch(() => false);
                }

                if (ctx.permissions.has('manageMessages')) {
                        eris.deleteMessages(channel.id, messages)
                                .catch(() => false);
                } else {
                        lastMsg = messages.at(-1);
                        messages = messages.slice(0, -1);

                        for (const id of messages) {
                                eris.deleteMessage(channel.id, id)
                                        .catch(() => false);
                        }
                        
                        await eris.deleteMessage(channel.id, lastMsg).catch(() => false);
                }

                ctx.module.deleteCommand(ctx);

                return ctx.removeLoadingReaction().catch(() => false);
        }
});