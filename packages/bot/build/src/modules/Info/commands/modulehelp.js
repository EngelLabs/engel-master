"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'modulehelp',
    usage: '<*module>',
    aliases: ['mhelp'],
    info: 'Get help for a module',
    examples: [
        'help mod',
        'help automoderator',
        'help cc'
    ],
    requiredArgs: 1,
    cooldown: 1500,
    execute: function (ctx) {
        const verbose = ctx.guildConfig.verboseHelp !== undefined ? ctx.guildConfig.verboseHelp : true;
        const text = ctx.args.join(' ');
        const embed = ctx.core.modules.help(text, ctx.prefix, ctx.isAdmin, verbose);
        if (!embed) {
            return ctx.error(`Module \`${text}\` not found.`);
        }
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=modulehelp.js.map