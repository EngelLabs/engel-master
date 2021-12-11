const Command = require('../../../structures/Command');


module.exports = new Command({
    name: 'prefix',
    aliases: ['prefixes'],
    info: 'View server prefixes',
    cooldown: 4000,
    dmEnabled: true,
    disableModuleCheck: true,
    execute: function (ctx) {
        let msg;

        if (!ctx.guild) {
            prefixes = ctx.guildConfig.prefixes.filter(({ length }) => length);
            msg = `Hi! My prefix${prefixes.length > 1 ? 'es' : ''} in dms are: `;
            msg += prefixes.map(p => `\`${p}\``).join(', ');
            msg += '\nYou can also use commands by mentioning me';
            if (ctx.guildConfig.prefixes.includes('')) {
                msg += ' or by not providing a prefix at all';
            }
            msg += '.';
        } else {
            if (ctx.guildConfig.prefixes.length > 1) {
                msg = `Prefixes for **${ctx.guild.name}**: `;
                msg += ctx.guildConfig.prefixes.map(p => `\`${p}\``).join(', ');
            } else {
                msg = `Prefix for **${ctx.guild.name}**: \`${ctx.guildConfig.prefixes[0]}\``
            }
        }

        return ctx.success(msg);
    },
});