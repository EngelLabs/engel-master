const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'refresh',
    usage: '[guild]',
    info: 'Refresh a guild\'s configuration',
    dmEnabled: true,
    execute: async function (ctx) {
        if (!ctx.args.length && !ctx.guild) return ctx.error('Must provide a guild ID.');

        const guildId = ctx.args[0] || ctx.guild.id;
        let guildConfig;

        try {
            guildConfig = await ctx.bot.guilds.fetch(guildId);
        } catch (err) {
            return ctx.error(err);
        }

        return guildConfig
            ? ctx.success(`Guild \`${guildId}\`'s configuration refreshed.`)
            : ctx.error(`Guild \`${guildId}\`'s configuration does not exist.'`);
    }
});