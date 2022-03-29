"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'serverinfo',
    aliases: [
        'sinfo',
        'guildinfo'
    ],
    info: 'View server related information',
    execute: function (ctx) {
        const { guild, guildConfig } = ctx, guildOwner = guild.members.get(guild.ownerID), roles = guild.roles.map(r => r.mention).join(', ');
        const embed = {
            color: ctx.config.colours.info,
            timestamp: new Date().toISOString(),
            fields: [
                { name: 'ID', value: guild.id, inline: true }
            ],
            footer: {
                text: `Requested by: ${ctx.author.username}#${ctx.author.discriminator}`,
                icon_url: ctx.author.avatarURL
            },
            thumbnail: { url: guild.iconURL }
        };
        if (guildOwner) {
            embed.fields.push({
                name: 'Owner',
                value: `${guildOwner.username}#${guildOwner.discriminator}`,
                inline: true
            });
        }
        embed.fields.push({
            name: `Prefixes [${guildConfig.prefixes.length}]`,
            value: guildConfig.prefixes.map(p => `\`${p}\``).join(', '),
            inline: true
        });
        embed.fields.push({
            name: 'Created at',
            value: (new Date(guild.createdAt)).toString(),
            inline: true
        });
        embed.fields.push({
            name: `Members [${guild.memberCount}]`,
            value: [
                `Humans: ${guild.members.filter(m => !m.bot).length}`,
                `Bots: ${guild.members.filter(m => m.bot).length}`
            ].join('\n'),
            inline: true
        });
        embed.fields.push({
            name: `Channels: [${guild.channels.size}]`,
            value: [
                `Text: ${guild.channels.filter(c => c.type === eris.Constants.ChannelTypes.GUILD_TEXT).length}`,
                `Voice: ${guild.channels.filter(c => c.type === eris.Constants.ChannelTypes.GUILD_VOICE).length}`,
                `Stage: ${guild.channels.filter(c => c.type === eris.Constants.ChannelTypes.GUILD_STAGE_VOICE).length}`,
                `Categories: ${guild.channels.filter(c => c.type === eris.Constants.ChannelTypes.GUILD_CATEGORY).length}`
            ].join('\n'),
            inline: true
        });
        embed.fields.push({
            name: `Roles [${guild.roles.size}]`,
            value: roles.length <= 1024 ? roles : 'Too many to list.',
            inline: true
        });
        return ctx.send({ embed });
    }
});
//# sourceMappingURL=serverinfo.js.map