"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
const reload = new Command_1.default({
    name: 'reload',
    info: 'Reload modules',
    usage: '[...modules]',
    aliases: ['r'],
    dmEnabled: true,
    execute: function (ctx) {
        if (!ctx.baseConfig.dev)
            return Promise.resolve();
        const start = Date.now();
        try {
            var res = ctx.core.modules.reload(ctx.args.length ? ctx.args : null);
        }
        catch (err) {
            return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
        }
        if (!res) {
            return ctx.error('Could not find any modules to reload.');
        }
        const diff = Date.now() - start;
        return ctx.success(`Reloaded ${res} modules. Time expended: ${diff}ms`);
    }
});
reload.command({
    name: 'config',
    info: 'Sync global configuration for current process',
    dmEnabled: true,
    execute: async function (ctx) {
        try {
            await ctx.core.configure();
        }
        catch (err) {
            return ctx.error(`Something went wrong: ${err}`);
        }
        return ctx.addSuccessReaction();
    }
});
exports.default = reload;
//# sourceMappingURL=reload.js.map