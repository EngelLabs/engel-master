"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
const Permission_1 = require("../../../core/helpers/Permission");
exports.default = new Command_1.default({
    name: 'premium',
    info: 'Get information regarding Premium',
    cooldown: 30000,
    execute: function (ctx) {
        const permissions = new Permission_1.default(ctx.app);
        let msg = '';
        msg += 'Premium enables an improved engel experience by giving you access to an improved and extended feature set.\n';
        msg += 'It also helps the development and uptime of the bot. No, it\'s not available yet (still under development!).\n';
        if (permissions.isOwner(ctx.guild, ctx.author) && ctx.guildConfig.isPremium && !ctx.guildConfig.hasPremium) {
            msg += 'You somehow have a premium plan for this guild. You will be able to invite the premium bot when the beta launches.';
        }
        return ctx.premium(msg);
    }
});
//# sourceMappingURL=premium.js.map