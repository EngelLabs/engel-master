const Config = require('../../../models/Config');
const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'adminonly',
    info: 'Toggle admin-only mode',
    execute: async function (ctx) {
        await Config.updateOne({ state: ctx.config.state }, { $set: { adminOnly: !ctx.config.adminOnly }});
        await ctx.bot.updateConfig();

        return ctx.success(`Admin-only set to \`${ctx.config.adminOnly}\``);
    }
});