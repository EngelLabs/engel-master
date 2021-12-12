const Command = require('../../../structures/Command');
const Guild = require('../../../models/Guild');


module.exports = new Command({
    name: 'setprefix',
    usage: '<*prefix>',
    info: 'Replace server prefixes with given prefix',
    cooldown: 6000,
    requiredArgs: 1,
    execute: async function (ctx) {
        let prefix = ctx.args.join(' ');

        if (prefix.startsWith('"') && prefix.endsWith('"')) {
            prefix = prefix.slice(1, -1).trimLeft();
        }

        if (!prefix.length ||
            prefix.length >= 13) {
            return ctx.error('Invalid prefix length. Must be between 1-12.');
        }

        ctx.guildConfig.prefixes = [prefix];
        ctx.bot.guilds.update(ctx.guildConfig.id, { $set: { 'prefixes': [prefix] } });

        return ctx.success(`Replaced prefixes with \`${prefix}\``);
    }
});