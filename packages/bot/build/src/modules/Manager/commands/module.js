"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'module',
    usage: '<module>',
    info: 'Enable or disable a module',
    examples: [
        'module moderator',
        'module logging'
    ],
    cooldown: 3000,
    requiredArgs: 1,
    alwaysEnabled: true,
    execute: function (ctx) {
        const module = ctx.core.modules.get(ctx.args[0].slice(0, 1).toUpperCase() + ctx.args[0].slice(1));
        if (!module || module.private || module.internal || module.disabled) {
            return ctx.error(`Module \`${ctx.args[0]}\` not found.`);
        }
        const moduleName = module.dbName;
        const moduleConfig = ctx.moduleConfig = ctx.moduleConfig || {};
        moduleConfig.disabled = !moduleConfig.disabled;
        const queryString = moduleName + '.disabled';
        ctx.core.guilds.update(ctx.guildConfig.id, { $set: { [queryString]: moduleConfig.disabled } });
        return ctx.success(moduleConfig.disabled
            ? `Module \`${module.name}\` disabled.`
            : `Module \`${module.name}\` enabled.`);
    }
});
//# sourceMappingURL=module.js.map