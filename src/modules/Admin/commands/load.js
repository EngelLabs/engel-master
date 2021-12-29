const Command = require('../../../core/structures/Command');


module.exports = new Command({
    name: 'load',
    info: 'Load modules',
    usage: '[...modules]',
    aliases: ['l'],
    dmEnabled: true,
    execute: function (ctx) {
        if (!ctx.baseConfig.dev) return Promise.resolve();

        try {
            var res = ctx.bot.modules.load(ctx.args.length ? ctx.args : false);
        } catch (err) {
            return ctx.error(`Something went wrong: ${err}`);
        }

        return ctx.success(`Loaded ${res} modules`);
    },
});