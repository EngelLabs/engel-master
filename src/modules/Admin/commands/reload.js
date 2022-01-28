const Command = require('../../../core/structures/Command');


const reload = new Command({
        name: 'reload',
        info: 'Reload modules',
        usage: '[...modules]',
        aliases: ['r'],
        dmEnabled: true,
        execute: function (ctx) {
                if (!ctx.config.dev) return Promise.resolve();

                try {
                        var res = ctx.bot.modules.reload(ctx.args.length ? ctx.args : false);
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.success(`Reloaded ${res} modules`);
        },
});

reload.command({
        name: 'config',
        info: 'Sync global configuration for current process',
        dmEnabled: true,
        execute: async function (ctx) {
                try {
                        await ctx.bot.updateConfig();
                } catch (err) {
                        return ctx.error(`Something went wrong: ${err}`);
                }

                return ctx.addSuccessReaction();
        }
});


module.exports = reload;