const Command = require('../../../structures/Command');
const moment = require('moment');


module.exports = new Command({
    name: 'roleinfo',
    usage: '<*role>',
    requiredArgs: 1,
    aliases: ['rinfo'],
    examples: [
        'roleinfo @Moderator',
        'roleinfo 859169678966784031',
    ],
    execute: async function (ctx) {
        try {
            var role = await ctx.bot.converter.role(ctx, ctx.args.join(' '));
        } catch (err) {
            return ctx.error(err);
        }

        if (!role) return ctx.error(`Role \`${ctx.args.join(' ')}\` not found.`);

        const embed = {
            color: role.color,
            timestamp: new Date().toISOString(),
            author: { name: `Role: ${role.name}` },
            fields: [
                { name: 'ID', value: role.id, inline: false },
                { name: 'Colour', value: role.color ? role.color : 'Default', inline: false },
                { name: 'Created at', value: moment(role.createdAt).format('LLLL'), inline: false },
                { name: 'Bearers', value: ctx.guild.members.filter(m => m.roles.includes(role.id)).length, inline: false },
            ],
            footer: {
                text: `Requested by: ${ctx.author.username}#${ctx.author.discriminator}`,
                icon_url: ctx.author.iconURL,
            },
        };

        return ctx.send({ embed });
    }
});