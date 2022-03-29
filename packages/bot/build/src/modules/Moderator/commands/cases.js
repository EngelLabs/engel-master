"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
const Converter_1 = require("../../../core/helpers/Converter");
const Moderation_1 = require("../../../core/helpers/Moderation");
exports.default = new Command_1.default({
    name: 'cases',
    usage: '<user>',
    info: 'View moderation cases for a user or channel',
    aliases: [
        'modlogs'
    ],
    examples: [
        'cases @timtoy',
        'cases 932117428496904283',
        'modlogs 338082875394097153'
    ],
    cooldown: 10000,
    requiredArgs: 1,
    execute: async function (ctx) {
        const converter = new Converter_1.default(ctx.core);
        let id = converter.userID(ctx.args[0]);
        if (isNaN(parseInt(id))) {
            id = converter.channelID(ctx.args[0]);
            if (isNaN(parseInt(id))) {
                return ctx.error(`Channel/User \`${ctx.args[0]}\` is invalid.`);
            }
        }
        try {
            var modlogs = await ctx.models.ModLog
                .find({ guild: ctx.guild.id, $or: [{ 'user.id': id }, { 'channel.id': id }] })
                .lean();
        }
        catch (err) {
            return ctx.error(err);
        }
        if (!modlogs.length) {
            return ctx.error('No cases found for that channel/user.');
        }
        const moderation = new Moderation_1.default(ctx.core);
        const msg = modlogs
            .map(m => {
            if (m.user?.id === id) {
                return moderation.formatModlog(m, false, true);
            }
            return moderation.formatModlog(m, true, false);
        })
            .join('\n');
        const embed = {
            title: `**Cases for ${id}**`,
            description: msg,
            color: ctx.config.colours.success
        };
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=cases.js.map