"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'unload',
    info: 'Unload modules',
    usage: '[...modules]',
    aliases: ['u'],
    dmEnabled: true,
    execute: async function (ctx) {
        if (!ctx.baseConfig.dev)
            return Promise.resolve();
        const start = Date.now();
        try {
            var res = ctx.core.modules.unload(ctx.args.length ? ctx.args : null);
            if (!ctx.core.modules.get('core')) {
                await ctx.core.modules.load(['Core']);
            }
        }
        catch (err) {
            return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
        }
        if (!res) {
            return ctx.error('Could not find any modules to unload.');
        }
        const diff = Date.now() - start;
        return ctx.success(`Unloaded ${res} modules. Time expended: ${diff}ms`);
    }
});
//# sourceMappingURL=unload.js.map