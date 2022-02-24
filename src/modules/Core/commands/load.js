const { Command } = require('@engel/core');


module.exports = new Command({
        name: 'load',
        info: 'Load modules',
        usage: '[...modules]',
        aliases: ['l'],
        dmEnabled: true,
        execute: function (ctx) {
                if (!ctx.baseConfig.dev) return Promise.resolve();

                try {
                        var res = ctx.core.modules.load(ctx.args.length ? ctx.args : false);
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.success(`Loaded ${res} modules`);
        },
});