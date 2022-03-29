"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prettyMS = require("pretty-ms");
const Command_1 = require("../../../core/structures/Command");
const Converter_1 = require("../../../core/helpers/Converter");
exports.default = new Command_1.default({
    name: 'duration',
    usage: '<case> [*new duration]',
    info: 'Update or remove a moderation case\'s duration',
    examples: [
        'duration 69',
        'duration 120 10m'
    ],
    cooldown: 8500,
    requiredArgs: 1,
    execute: async function (ctx) {
        const caseNum = parseInt(ctx.args[0]);
        if (isNaN(caseNum) || caseNum < 0) {
            return ctx.error(`\`${ctx.args[0]}\` is not a valid case number.`);
        }
        const converter = new Converter_1.default(ctx.core);
        const duration = converter.duration(ctx.args[1]);
        if (duration && duration < 300)
            return ctx.error('Duration must be at least 5 minutes');
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
        if (!result.matchedCount)
            return ctx.error(`Case \`${ctx.args[0]}\` doesn't exist or doesn't have an active timer.`);
        return ctx.success(`Case \`${ctx.args[0]}\`'s duration updated to \`${prettyMS(duration * 1000)}\`.`);
    }
});
//# sourceMappingURL=duration.js.map