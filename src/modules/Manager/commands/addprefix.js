const Command = require('../../../structures/Command');
const Guild = require('../../../models/Guild');


module.exports = new Command({
    name: 'addprefix',
    usage: '<*prefix>',
    info: 'Add a server prefix',
    cooldown: 4000,
    requiredArgs: 1,
    execute: async function (ctx) {
        if (ctx.guildConfig.prefixes.length >= 15) {
            return ctx.error('You are at the 15 prefix limit.');
        }

        let prefix = ctx.args.join(' ');

        if (prefix.startsWith('"') && prefix.endsWith('"')) {
            prefix = prefix.slice(1, -1).trimLeft();
        }

        if (!prefix.length ||
            prefix.length >= 13) {
            return ctx.error('Invalid prefix length. Must be between 1-12.');
        }

        if (ctx.guildConfig.prefixes.includes(prefix)) {
            return ctx.error('That prefix already exists.');
        }

        ctx.guildConfig.prefixes.push(prefix);
        ctx.bot.guilds.update(ctx.guildConfig, { $addToSet: { 'prefixes': prefix } });

        return ctx.success(`Added prefix \`${prefix}\`.`);
    }
});