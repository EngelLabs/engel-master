import type * as mongoose from 'mongoose';
import type * as types from '@engel/types';
import Command from '../../../core/structures/Command';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'reason',
        usage: '<case> [*new reason]',
        info: 'Update or remove a moderation case\'s reason.',
        examples: [
                'reason 90',
                'reason 23 potato'
        ],
        cooldown: 8500,
        requiredArgs: 1,
        execute: async function (ctx) {
                const caseNum = parseInt(ctx.args[0]);

                if (isNaN(caseNum) || caseNum < 0) {
                        return ctx.error(`\`${ctx.args[0]}\` is not a valid case number.`);
                }

                ctx.args.shift();
                const reason = ctx.args.join(' ');

                const filter = {
                        guild: ctx.guild.id,
                        case: caseNum
                };

                const update: mongoose.UpdateQuery<types.ModLog> = reason?.length
                        ? { $set: { reason: reason } }
                        : { $unset: { reason: null } };

                const result = await ctx.models.ModLog
                        .updateOne(filter, update)
                        .exec();

                if (!result.matchedCount) return ctx.error(`Case \`${ctx.args[0]}\` not found.`);

                return reason?.length
                        ? ctx.success(`Case \`${caseNum}\`'s reason updated.`)
                        : ctx.success(`Case \`${caseNum}\`'s reason removed.`);
        }
});
