const { Command } = require('@engel/core');
const moment = require('moment');


module.exports = new Command({
        name: 'roleinfo',
        usage: '<role>',
        requiredArgs: 1,
        aliases: ['rinfo'],
        examples: [
                'roleinfo @Moderator',
                'roleinfo 859169678966784031',
        ],
        execute: async function (ctx) {
                try {
                        var role = await ctx.helpers.converter.role(ctx.guild, ctx.args[0]);
                } catch (err) {
                        return ctx.error(err.toString?.());
                }

                if (!role) return ctx.error(`Role \`${ctx.args[0]}\` not found.`);

                const embed = {
                        color: role.color,
                        timestamp: new Date().toISOString(),
                        author: { name: `Role: ${role.name}` },
                        fields: [
                                { name: 'ID', value: role.id, inline: false },
                                { name: 'Colour', value: role.color ? role.color : 'Default', inline: false },
                                { name: 'Created at', value: moment(role.createdAt).utc().format('LLLL'), inline: false },
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