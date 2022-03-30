"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
const Moderation_1 = require("../../../core/helpers/Moderation");
exports.default = new Command_1.default({
    name: 'case',
    usage: '<case number>',
    info: 'View a moderation case by id',
    aliases: [
        'modlog'
    ],
    examples: [
        'case 69',
        'modlog 420'
    ],
    cooldown: 3000,
    requiredArgs: 1,
    execute: async function (ctx) {
        const caseNum = parseInt(ctx.args[0]);
        if (isNaN(caseNum) || caseNum < 0) {
            return ctx.error(`\`${ctx.args[0]}\` is not a valid case number.`);
        }
        try {
            var modlog = await ctx.models.ModLog
                .findOne({ guild: ctx.guild.id, case: caseNum })
                .lean();
        }
        catch (err) {
            return ctx.error(err);
        }
        if (!modlog)
            return ctx.error(`Case \`${ctx.args[0]}\` not found.`);
        const moderation = new Moderation_1.default(ctx.app);
        const embed = {
            description: moderation.formatModlog(modlog),
            color: ctx.config.colours.success
        };
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=case.js.map