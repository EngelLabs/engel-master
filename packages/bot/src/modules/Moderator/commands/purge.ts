import type * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Context from '../../../core/structures/Context';
import Converter from '../../../core/helpers/Converter';
import type Moderator from '..';

const purgeMessages = async (
        ctx: Context<Moderator>,
        count: string,
        check: (m: eris.Message<eris.TextChannel>) => boolean,
        reason?: string,
        type?: string
): Promise<void> => {
        let delCommand: boolean;

        if (typeof ctx.commandConfig !== 'boolean' && ctx.commandConfig?.del !== undefined) {
                delCommand = ctx.commandConfig.del;
        } else if (ctx.moduleConfig?.delCommands !== undefined) {
                delCommand = ctx.moduleConfig.delCommands;
        } else {
                delCommand = ctx.guildConfig.delCommands;
        }

        if (!delCommand) {
                ctx.addLoadingReaction()
                        .catch(() => false);
        }

        try {
                await ctx.module.purgeMessages(ctx, type || `purge [${ctx.command.name}]`, check, count, ctx.message.id, reason);
        } catch (err) {
                if (!delCommand) ctx.removeLoadingReaction().catch(() => false);

                ctx.error(err);

                return;
        }

        if (!delCommand) {
                ctx.removeLoadingReaction()
                        .catch(() => false);
        }
};

const purge = new Command<Moderator>({
        name: 'purge',
        usage: '[count=100] [*reason]',
        info: 'Purge messages from a channel',
        examples: [
                'purge 50',
                'purge 100 Removing spam messages'
        ],
        cooldown: 5000,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages'
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        () => true,
                        ctx.args.join(' '),
                        'purge'
                );
        }
});

purge.command({
        name: 'user',
        usage: '<user> [count=100] [*reason]',
        info: 'Purge a user\'s messages from a channel',
        examples: [
                'purge @timtoy 200 Spam'
        ],
        cooldown: 5000,
        requiredArgs: 1,
        requiredPermissions: [
                'readMessageHistory',
                'manageMessages'
        ],
        execute: async function (ctx) {
                const converter = new Converter(ctx.app);

                try {
                        var user = await converter.user(ctx.args[0], true);
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
                        ctx.args.join(' ')
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
                'manageMessages'
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => !!msg.embeds.length,
                        ctx.args.join(' ')
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
                'manageMessages'
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => msg.author.bot,
                        ctx.args.join(' ')
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
                'manageMessages'
        ],
        execute: function (ctx) {
                return purgeMessages(
                        ctx,
                        ctx.args.shift(),
                        msg => !msg.author.bot,
                        ctx.args.join(' ')
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
                'manageMessages'
        ],
        execute: function (ctx) {
                let args = ctx.args.join(' ');
                let text: string;

                if (args.startsWith('"') && args.lastIndexOf('"') !== -1) {
                        text = args.slice(1).slice(0, args.lastIndexOf('"') - 1);
                        args = args.slice(text.length + 2);
                } else {
                        text = args.split(' ')[0];
                        args = args.slice(text.length);
                }

                args = args.slice(text.length);

                const reason = args.length ? args : null;

                return purgeMessages(
                        ctx,
                        args.split(' ').shift(),
                        msg => msg.content && msg.content.includes(text),
                        reason
                );
        }
});

export default purge;
