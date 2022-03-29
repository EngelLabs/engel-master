"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'tag',
    usage: '<*tag name>',
    info: 'Find a server tag.',
    requiredArgs: 1,
    disableModuleCheck: true,
    execute: async function (ctx) {
        const name = ctx.args.join(' ');
        const tag = await ctx.models.Tag.findOneAndIncrement({ guild: ctx.guild.id, name });
        return tag
            ? ctx.send(tag.content).catch(() => false)
            : ctx.error(`Tag \`${name}\` not found.`);
    }
});
//# sourceMappingURL=tag.js.map