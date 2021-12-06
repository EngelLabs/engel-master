const Command = require('../../../structures/Command');
const Config = require('../../../models/Config');


module.exports = new Command({
    name: 'global-command-enable',
    usage: '[...commands]',
    info: 'Globally enable commands',
    dmEnabled: true,
    execute: async function (ctx) {
        const update = ctx.args.reduce((prev, curr) => (prev['commands.' + curr + '.enabled'] = true, prev), {});
        await Config.updateOne({ state: ctx.config.state }, { $set: update });
        await ctx.bot.updateConfig();

        return ctx.success(`Commands disabled: ${Object.values(ctx.config.commands).filter(c => !c.enabled).map(c => `\`${c.name}\``).join(', ') || 'None'}`);
    }
});