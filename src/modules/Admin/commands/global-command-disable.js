const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'global-command-disable',
    usage: '[...commands]',
    info: 'Globally disable commands',
    dmEnabled: true,
    execute: async function (ctx) {
        const update = ctx.args.reduce((prev, curr) => (prev['commands.' + curr + '.disabled'] = true, prev), {});
        await ctx.models.Config.updateOne({ state: ctx.config.state }, { $set: update });
        await ctx.bot.updateConfig();

        return ctx.success(`Commands disabled: ${Object.values(ctx.config.commands).filter(c => c.disabled).map(c => `\`${c.name}\``).join(', ') || 'None'}`);
    }
});