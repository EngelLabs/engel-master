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
            prefix.length >= 12) {
            return ctx.error(`Invalid prefix.`);
        }

        if (ctx.guildConfig.prefixes.includes(prefix)) {
            return ctx.error('That prefix already exists.');
        }

        await Guild.updateOne({ id: ctx.guildConfig.id },
            { $addToSet: { 'prefixes': prefix } });

        ctx.guildConfig.prefixes.push(prefix);
        return ctx.success(`Added prefix \`${prefix}\`.`);
    }
});