const Command = require('../../../structures/Command');


const before = ctx => {
    if (!ctx.args.length && !ctx.guild) {
        ctx.done = true;
        return ctx.error('Must provide a guild ID.');
    }

    ctx.guildId = ctx.args[0] || ctx.guild.id;
}

const config = new Command({
    name: 'config',
    usage: '[guild]',
    info: 'Manage a guild\'s configuration',
    before,
    dmEnabled: true,
    execute: async function (ctx) {
        const guildConfig = await ctx.bot.guilds.fetch(ctx.guildId);

        if (guildConfig) {
            return ctx.success(`Guild \`${ctx.guildId}\`'s configuration refreshed.`);
        }

        await ctx.bot.guilds.create(ctx.guildId);

        return ctx.success(`Guild \`${ctx.guildId}\`'s configuration created.`);
    }
});

config.command({
    name: 'delete',
    aliases: ['d', 'del'],
    info: 'Delete a guild\'s configuration',
    before,
    dmEnabled: true,
    execute: async function (ctx) {
        const result = await ctx.models.Guild.deleteOne({ id: ctx.guildId });

        return result.deletedCount
            ? ctx.success(`Guild \`${ctx.guildId}\`'s configuration deleted.`)
            : ctx.error(`Guild \`${ctx.guildId}\` has not been configured.`);
    }
})


module.exports = config;