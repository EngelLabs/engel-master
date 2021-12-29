const Command = require('../../../core/structures/Command');


module.exports = new Command({
    name: 'unload',
    info: 'Unload modules',
    usage: '[...modules]',
    aliases: ['u'],
    dmEnabled: true,
    execute: function (ctx) {
        if (!ctx.baseConfig.dev) return Promise.resolve();
        
        try {
            var res = ctx.bot.modules.unload(ctx.args.length ? ctx.args : false);
        } catch (err) {
            return ctx.error(`Something went wrong: ${err}`);
        }

        return ctx.success(`Unloaded ${res} modules`);
    },
});