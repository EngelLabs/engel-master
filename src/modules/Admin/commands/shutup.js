const Command = require('../../../structures/Command');
const Config = require('../../../models/Config');


module.exports = new Command({
    name: 'shutup',
    info: 'Toggle shutup mode',
    execute: async function (ctx) {
        await Config.updateOne({ state: ctx.config.state }, { $set: { shutup: !ctx.config.shutup }});
        await ctx.bot.updateConfig();

        return ctx.success(`Shutup mode set to \`${ctx.config.shutup}\``);
    }
})