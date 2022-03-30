"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'load',
    info: 'Load modules',
    usage: '[...modules]',
    aliases: ['l'],
    dmEnabled: true,
    execute: async function (ctx) {
        if (!ctx.baseConfig.dev)
            return Promise.resolve();
        const start = Date.now();
        try {
            var res = await ctx.app.modules.load(ctx.args.length ? ctx.args : null);
        }
        catch (err) {
            return ctx.error('Something went wrong\n' + '```\n' + (err?.toString?.() || err) + '\n```');
        }
        if (!res) {
            return ctx.error('Could not find any modules to load.');
        }
        const diff = Date.now() - start;
        return ctx.success(`Loaded ${res} modules. Time expended: ${diff}ms`);
    }
});
//# sourceMappingURL=load.js.map