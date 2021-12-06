const Command = require('../../../structures/Command');
const Config = require('../../../models/Config');


module.exports = new Command({
    name: 'global-module-enable',
    usage: '[...modules]',
    info: 'Globally enable modules',
    dmEnabled: true,
    execute: async function (ctx) {
        const update = ctx.args.reduce((prev, curr) => (prev['modules.' + curr + '.enabled'] = true, prev), {});
        await Config.updateOne({ state: ctx.config.state }, { $set: update });
        await ctx.bot.updateConfig();

        return ctx.success(`Modules disabled: ${Object.values(ctx.config.modules).filter(m => !m.enabled).map(m => `\`${m.name}\``).join(', ') || 'None'}`);
    }
});