const { Command } = require('@engel/core');
const prettyMS = require('pretty-ms');


module.exports = new Command({
        name: 'duration',
        usage: '<case> [*new duration]',
        info: 'Update or remove a moderation case\'s duration',
        examples: [
                'duration 69',
                'duration 120 10m',
        ],
        cooldown: 8500,
        requiredArgs: 1,
        execute: async function (ctx) {
                const caseNum = parseInt(ctx.args[0]);

                if (isNaN(caseNum) || caseNum < 0) {
                        return ctx.error(`\`${ctx.args[0]}\` is not a valid case number.`);
                }

                const duration = ctx.helpers.converter.duration(ctx.args[1]);

                if (duration && duration < 300) return ctx.error(`Duration must be at least 5 minutes`);

                const filter = {
                        expiry: { $gte: Date.now() },
                        guild: ctx.guild.id,
                        case: caseNum
                };

                const update = duration
                        ? { $set: { duration: duration * 1000, expiry: Date.now() + duration * 1000 } }
                        : { $unset: { duration: null, expiry: null } };


                const result = await ctx.models.ModLog
                        .updateOne(filter, update)
                        .exec();

                if (!result.matchedCount) return ctx.error(`Case \`${ctx.args[0]}\` doesn't exist or doesn't have an active timer.`);

                return ctx.success(`Case \`${ctx.args[0]}\`'s duration updated to \`${prettyMS(duration * 1000)}\`.`);
        }
});