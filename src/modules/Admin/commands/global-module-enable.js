const Command = require('../../../core/structures/Command');


module.exports = new Command({
    name: 'global-module-enable',
    usage: '[...modules]',
    info: 'Globally enable modules',
    dmEnabled: true,
    execute: async function (ctx) {
        const update = ctx.args.reduce((prev, curr) => (prev['modules.' + curr + '.disabled'] = false, prev), {});
        await ctx.models.Config.updateOne({ state: ctx.config.state }, { $set: update });
        await ctx.bot.updateConfig();

        return ctx.success(`Modules disabled: ${Object.values(ctx.config.modules).filter(m => m.disabled).map(m => `\`${m.name}\``).join(', ') || 'None'}`);
    }
});