const Command = require('../../../structures/Command');
const Config = require('../../../models/Config');


module.exports = new Command({
    name: 'toggle',
    info: 'Toggle a boolean value in configuration',
    requiredArgs: 1,
    execute: async function (ctx) {
        const key = ctx.args[0];
        const value = ctx.config[key];

        if (typeof value !== 'boolean') {
            return ctx.error(`\`${key}\` is not a valid boolean key.`);
        }

        await Config.updateOne({ state: ctx.config.state }, { $set: { [key]: !value } });
        await ctx.bot.updateConfig();
        return ctx.success(`Updated key \`${key}\`, value: \`${ctx.config[key]}\``)
    }
})