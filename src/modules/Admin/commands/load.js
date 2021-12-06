const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'load',
    info: 'Load modules',
    usage: '[...modules]',
    dmEnabled: true,
    execute: function (ctx) {
        if (!ctx.config.dev) {
            return ctx.error('WARNING: Don\'t modify module state during production.');
        }

        try {
            var res = ctx.bot.modules.load(ctx.args.length ? ctx.args : false);
        } catch (err) {
            return ctx.error(`Something went wrong: ${err}`);
        }

        return ctx.success(`Loaded ${res} modules`);
    },
});