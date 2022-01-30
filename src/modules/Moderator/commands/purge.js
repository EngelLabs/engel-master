const Command = require('../../../core/structures/Command');


const purgeMessages = async (ctx, count, check, reason, type) => {
        let result, delCommand;

        if (ctx.commandConfig && ctx.commandConfig.del !== undefined) {
                delCommand = ctx.commandConfig.del;
        } else if (ctx.moduleConfig && ctx.moduleConfig.delCommands !== undefined) {
                delCommand = ctx.moduleConfig.delCommands;
        } else {
                delCommand = ctx.guildConfig.delCommands;
        }

        if (!delCommand) {
                ctx.addLoadingReaction()
                        .catch(() => false);
        }
        
        try {
                result = await ctx.module.purgeMessages(ctx, type, check, count, ctx.message.id, reason);
        } catch (err) {
                if (!delCommand) ctx.removeLoadingReaction().catch(() => false);

                throw err;
        }

        if (!delCommand) {
                ctx.removeLoadingReaction()
                        .catch(() => false);
        }

        return Promise.resolve();
}


const purge = new Command({
        name: 'purge',
        usage: '[count=100] [*reason]',
        info: 'Purge messages from a channel',
        examples: [
                'purge 50',
                'purge 100 Removing spam messages',
        ],
        cooldown: 5000,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages',
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        () => true,
                        ctx.args.join(' '),
                        'normal',
                );
        }
});

purge.command({
        name: 'user',
        usage: '<user> [count=100] [*reason]',
        info: 'Purge a user\'s messages from a channel',
        examples: [
                'purge @timtoy 200 Spam',
        ],
        cooldown: 5000,
        requiredArgs: 1,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages',
        ],
        execute: async function (ctx) {
                let user;

                try {
                        user = await ctx.helpers.converter.user(ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) {
                        return ctx.error(`User \`${ctx.args[0]}\` not found.`);
                }

                ctx.args.shift();

                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => msg.author.id === user.id,
                        ctx.args.join(' '),
                );
        }
});

purge.command({
        name: 'embeds',
        usage: '[count=100] [*reason]',
        info: 'Purge messages from a channel containing embeds',
        cooldown: 5000,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages',
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => msg.embeds && msg.embeds.length,
                        ctx.args.join(' '),
                );
        }
});

purge.command({
        name: 'bots',
        usage: '[count=100] [*reason]',
        info: 'Purge messages from a channel sent by bots',
        cooldown: 5000,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages',
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => msg.author.bot,
                        ctx.args.join(' '),
                );
        }
});

purge.command({
        name: 'humans',
        usage: '[count=100] [*reason]',
        info: 'Purge messages from a channel sent by humans',
        cooldown: 5000,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages',
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => !msg.author.bot,
                        ctx.args.join(' '),
                );
        }
});

purge.command({
        name: 'text',
        usage: '<text> [count=100] [*reason]',
        info: 'Purge messages from a channel containing specified text',
        cooldown: 5000,
        requiredArgs: 1,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages',
        ],
        execute: function (ctx) {
                let args = ctx.args.join(' ');
                let text;

                if (args.startsWith('"') && args.lastIndexOf('"') !== -1) {
                        text = args.slice(1).slice(0, args.lastIndexOf('"') - 1);
                        args = args.slice(text.length + 2);
                } else {
                        text = args.split(' ')[0];
                        args = args.slice(text.length);
                }

                args = args.slice(text.length);

                args = args.length ? args : [];

                return purgeMessages(
                        ctx,
                        args.shift(),
                        msg => msg.content && msg.content.includes(text),
                        args.join(' '),
                );
        }
});


module.exports = purge;