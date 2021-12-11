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
            prefix.length >= 12) {
            return ctx.error('Invalid prefix.');
        }

        await Guild.updateOne({ id: ctx.guildConfig.id },
            { $set: { 'prefixes': [prefix] } });

        ctx.guildConfig.prefixes = [prefix];
        return ctx.success(`Replaced prefixes with \`${prefix}\``);
    }
});