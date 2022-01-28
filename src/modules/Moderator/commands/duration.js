const Command = require('../../../core/structures/Command');
const prettyMS = require('pretty-ms');


module.exports = new Command({
        name: 'duration',
        usage: '<case> <*new duration>',
        info: 'Update a moderation case\'s duration',
        examples: [
                'duration 69 8h',
                'duration 120 10m',
        ],
        cooldown: 8500,
        requiredArgs: 2,
        execute: async function (ctx) {
                const caseNum = parseInt(ctx.args[0]);

                if (isNaN(caseNum) || caseNum < 0) {
                        return ctx.error(`\`${ctx.args[0]}\` is not a valid case number.`);
                }

                const duration = ctx.helpers.converter.duration(ctx.args[1]);

                if (!duration) return ctx.error(`Duration \`${ctx.args[1]}\` is invalid.`);
                if (duration < 300) return ctx.error(`Duration must be at least 5 minutes`);

                const filter = {
                        expiry: { $gte: Date.now() },
                        guild: ctx.guild.id,
                        case: caseNum
                };

                const result = await ctx.models.ModLog
                        .updateOne(filter, { $set: { duration: duration * 1000, expiry: Date.now() + duration * 1000 } })
                        .exec();

                if (!result.matchedCount) return ctx.error(`Case \`${ctx.args[0]}\` not found/doesn't have an active timer.`);

                return ctx.success(`Case \`${ctx.args[0]}\`'s duration updated to \`${prettyMS(duration * 1000)}\`.`);
        }
});