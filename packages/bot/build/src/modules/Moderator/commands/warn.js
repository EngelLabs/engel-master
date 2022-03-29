"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
const Converter_1 = require("../../../core/helpers/Converter");
exports.default = new Command_1.default({
    name: 'warn',
    usage: '<user> <*reason>',
    info: 'Warn a server member',
    examples: [
        'warn @timtoy stop being mean >:(',
        'warn 338082875394097153 annoying'
    ],
    cooldown: 3000,
    requiredArgs: 2,
    execute: async function (ctx) {
        const converter = new Converter_1.default(ctx.core);
        try {
            var user = await converter.user(ctx.args[0], true);
        }
        catch (err) {
            return ctx.error(err);
        }
        if (!user)
            return ctx.error(`User \`${ctx.args[0]}\` not found.`);
        if (!ctx.module.canModerate(ctx, user, 'warn'))
            return;
        ctx.args.shift();
        const reason = ctx.args.join(' ');
        ctx.module.sendDM(ctx, user, `You were warned in ${ctx.guild.name} for ${reason}.`, null, null);
        ctx.module.createModlog(ctx, 'warn', null, null, reason, ctx.author, user, null);
        ctx.module.customResponse(ctx, 'warn', user, null);
    }
});
//# sourceMappingURL=warn.js.map