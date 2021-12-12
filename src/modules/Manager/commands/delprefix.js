const Command = require('../../../structures/Command');
const Guild = require('../../../models/Guild');


module.exports = new Command({
    name: 'delprefix',
    usage: '<*prefix>',
    aliases: ['removeprefix', 'rprefix'],
    info: 'Remove a server prefix',
    cooldown: 4000,
    requiredArgs: 1,
    execute: async function (ctx) {
        let prefix = ctx.args.join(' ');

        if (prefix.startsWith('"') && prefix.endsWith('"')) {
            prefix = prefix.slice(1, -1).trimLeft();
        }

        if (!ctx.guildConfig.prefixes.includes(prefix)) {
            return ctx.error('That prefix doesn\'t exist.');
        }

        let update;

        if (ctx.guildConfig.prefixes.length > 0) {
            update = { $pull: { 'prefixes': prefix } };

            ctx.guildConfig.prefixes = ctx.guildConfig.prefixes.filter(p => p !== prefix);

        } else {
            update = { $set: { 'prefixes': ctx.config.prefixes.default } };

            ctx.guildConfig.prefixes = ctx.config.prefixes.default;
        }

        await ctx.bot.guilds.update(ctx.guildConfig, update);

        return ctx.success(`Removed prefix \`${prefix}\`.`);
    }
});