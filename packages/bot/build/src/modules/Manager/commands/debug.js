"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'debug',
    usage: '<*command or module>',
    info: 'Debug a command or module',
    requiredArgs: 1,
    alwaysEnabled: true,
    execute: async function (ctx) {
        const module = ctx.core.modules.get(ctx.args.join(' '));
        if (!module || ((module.private || module.internal || module.disabled) && !ctx.isAdmin)) {
            let command = ctx.core.commands.get(ctx.args[0]);
            if (!command)
                return ctx.error('No command or module exists by that name');
            ctx.args.shift();
            while (command.commands && ctx.args.length) {
                const subcommand = command.commands.get(ctx.args[0]);
                if (!subcommand)
                    break;
                ctx.args.shift();
                command = subcommand;
            }
            if ((command.hidden && !ctx.isAdmin) ||
                ((command.module.private || command.module.internal || command.module.disabled) && !ctx.isAdmin)) {
                return ctx.error('No command or module exists by that name');
            }
            const embed = ctx.module.debugCommand(command, ctx.channel, ctx.guildConfig);
            return ctx.send({ embed });
        }
        const embed = ctx.module.debugModule(module, ctx.channel, ctx.guildConfig);
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=debug.js.map