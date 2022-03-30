"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const moment = require("moment");
const Command_1 = require("../../../core/structures/Command");
const Converter_1 = require("../../../core/helpers/Converter");
exports.default = new Command_1.default({
    name: 'roleinfo',
    usage: '<role>',
    requiredArgs: 1,
    aliases: ['rinfo'],
    examples: [
        'roleinfo @Moderator',
        'roleinfo 859169678966784031'
    ],
    execute: async function (ctx) {
        const converter = new Converter_1.default(ctx.app);
        try {
            var role = await converter.role(ctx.guild, ctx.args[0]);
        }
        catch (err) {
            return ctx.error(err.toString?.());
        }
        if (!role)
            return ctx.error(`Role \`${ctx.args[0]}\` not found.`);
        const bearers = ctx.guild.members.filter(m => m.roles.includes(role.id));
        const embed = {
            color: role.color,
            timestamp: new Date().toISOString(),
            author: { name: `Role: ${role.name}` },
            fields: [
                { name: 'ID', value: role.id, inline: false },
                { name: 'Colour', value: role.color ? role.color.toString() : 'Default', inline: false },
                { name: 'Created at', value: moment(role.createdAt).utc().format('LLLL'), inline: false },
                { name: 'Bearers', value: bearers.length.toString(), inline: false }
            ],
            footer: {
                text: `Requested by: ${ctx.author.username}#${ctx.author.discriminator}`,
                icon_url: ctx.author.avatarURL
            }
        };
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=roleinfo.js.map