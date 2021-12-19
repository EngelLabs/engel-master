const Command = require('../../../structures/Command');


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

        let messages = await ctx.eris.getMessages(ctx.channel.id, { limit: count, before: ctx.message.id });

        messages = messages
            .filter(msg => {
                if (msg.author.id !== ctx.eris.user.id) return false;
                if (msg.pinned) return false;

                if (msg.timestamp && (Date.now() - msg.timestamp) > (1000 * 60 * 60 * 24 * 14)) return false;

                return true;
            })
            .map(({ id }) => id);

        if (!messages || !messages.length) {
            return ctx.removeLoadingReaction().catch(() => false);
        }

        if (ctx.permissions.has('manageMessages')) {
            await ctx.eris.deleteMessages(ctx.channel.id, messages)
                .catch(() => false);
        } else {
            let p;

            for (const id of messages) {
                p = ctx.eris.deleteMessage(ctx.channel.id, id)
                    .catch(() => false);
            }

            await p;
        }

        ctx.module.deleteCommand(ctx);

        return ctx.removeLoadingReaction().catch(() => false);
    }
});