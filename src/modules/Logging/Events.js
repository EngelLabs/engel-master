const moment = require('moment');
const Base = require('../../core/structures/Base');


const colorMapping = {
        yellow: 14921762,
        red: 12202793
};


/**
 * Collection of event handlers
 * @class Events
 */
class Events extends Base {
        constructor(module) {
                super(module.bot);

                for (const fn of Object.values(this)) {
                        if (typeof fn !== 'function') continue;

                        const wrapped = async (guildConfig, ...args) => {
                                const moduleConfig = guildConfig.logging;

                                const eventConfig = moduleConfig[fn.name];

                                if (!eventConfig || eventConfig.disabled || !eventConfig.channel) return;

                                const webhook = moduleConfig.webhooks && moduleConfig.webhooks[eventConfig.channel];

                                if (!webhook) return;

                                let embeds = await this['_' + fn.name](guildConfig, ...args);

                                if (!embeds) return;

                                if (!(embeds instanceof Array)) embeds = [embeds];

                                for (const embed of embeds) {
                                        if (typeof embed.color !== 'undefined') {
                                                embed.color = eventConfig.color ||
                                                        (moduleConfig.colors && moduleConfig.colors[embed.color]) ||
                                                        colorMapping[embed.color] || null;
                                        }

                                        if (typeof embed.color !== 'number') {
                                                delete embed.color;
                                        }

                                        embed.timestamp = embed.timestamp || new Date().toISOString();
                                }

                                module.scheduleEmbeds(guildConfig, eventConfig, webhook, fn.name, embeds);
                        }

                        this['_' + fn.name] = fn;
                        this[fn.name] = wrapped;
                        this.log(`Registered event "${fn.name}"`, 'debug', 'Modules.Logging.Events');
                }
        }

        messageDelete = (_, message) => {
                let msg = '';

                msg += `**Message Deleted**\n`;
                msg += `**Channel:** ${message.channel.mention} (${message.channel.id})\n`;
                msg += `**Author:** ${message.author.mention} (${message.author.id})\n`;
                msg += `**Created:** ${moment(message.createdAt).format('LLLL')}\n`;
                msg += `**Content:** ${message.content}`;

                const embed = {
                        color: 'red',
                        timestamp: new Date(message.createdAt).toISOString(),
                        footer: {
                                text: `ID: ${message.id}, Message sent`,
                        },
                        author: {
                                name: this.fullName(message.author),
                                url: message.author.avatarURL,
                                icon_url: message.author.avatarURL,
                        },
                };

                if (msg.length > 2048) {
                        msg = msg.slice(0, -(message.content.length + 13));
                        embed.description = msg;
                        embed.footer.text = '[Page 1] ' + embed.footer.text;

                        const embeds = [];

                        embeds.push(embed);

                        const pageCount = Math.ceil(message.content.length / 2048);
                        msg = message.content;

                        for (let page = 1; page <= pageCount; page++) {
                                const e = {
                                        color: embed.color,
                                        title: 'Content',
                                        description: msg.slice(0, 2048),
                                        timestamp: embed.timestamp,
                                        footer: {
                                                text: `[Page ${page + 1}] ID: ${message.id}, Message sent`,
                                        },
                                        author: embed.author,
                                };

                                msg = msg.slice(2048);

                                embeds.push(e);
                        }

                        return embeds;

                } else {
                        embed.description = msg;

                        return embed;
                }
        }

        messageContentUpdate = (_, message, oldMessage) => {
                let msg = '';

                msg += `**Message Edited**\n`;
                msg += `**Channel:** ${message.channel.mention} (${message.channel.id})\n`;
                msg += `**Author:** ${message.author.mention} (${message.author.id})\n`;
                msg += `**Created:** ${moment(message.createdAt).format('LLLL')}\n`;
                msg += `**Before:** ${oldMessage.content}\n`;
                msg += `**After:** ${message.content}`;

                const embed = {
                        color: 'yellow',
                        timestamp: new Date(message.createdAt).toISOString(),
                        footer: {
                                text: `ID: ${message.id}, Message sent`
                        },
                        author: {
                                name: this.fullName(message.author),
                                url: message.author.avatarURL,
                                icon_url: message.author.avatarURL,
                        },
                };

                if (msg.length > 2048) {
                        msg = msg.slice(0, -(message.content.length + oldMessage.content.length + 24));
                        embed.description = msg;
                        embed.footer.text = '[Page 1] ' + embed.footer.text;

                        const embeds = [];

                        embeds.push(embed);

                        const pageCount = Math.ceil(oldMessage.content.length / 2048);
                        msg = oldMessage.content;

                        for (let page = 1; page <= pageCount; page++) {
                                const e = {
                                        color: embed.color,
                                        title: 'Before',
                                        description: msg.slice(0, 2048),
                                        timestamp: embed.timestamp,
                                        footer: {
                                                text: `[Page ${page + 1}] ID: ${message.id}, Message sent`,
                                        },
                                        author: embed.author,
                                };

                                msg = msg.slice(2048);

                                embeds.push(e);
                        }

                        const pageCount2 = Math.ceil(message.content.length / 2048);
                        msg = message.content;

                        for (let page = 1; page <= pageCount2; page++) {
                                const e = {
                                        color: embed.color,
                                        title: 'After',
                                        description: msg.slice(0, 2048),
                                        timestamp: embed.timestamp,
                                        footer: {
                                                text: `[Page ${page + pageCount + 1}] ID: ${message.id}, Message sent`,
                                        },
                                        author: embed.author,
                                };

                                msg = msg.slice(2048);

                                embeds.push(e);
                        }

                        return embeds;

                } else {
                        embed.description = msg;

                        return embed;
                }
        }

        guildAFKChannelUpdate = (_, guild, channel, oldChannel) => {

        }

        guildRoleCreate = (_, guild, role) => {
                let msg = '';

                msg += `**Role Created**\n`;
                msg += `**Name:** ${role.name}\n`;
                msg += `**Colour:** ${'#' + role.color.toString(16)}\n`;
                msg += `**Hoisted:** ${role.hoist}\n`;
                msg += `**Permissions:** ${this._formatRolePermissions(role.permissions)}`;

                return {
                        description: msg,
                        color: 'green',
                        timestamp: new Date(role.createdAt).toISOString(),
                        footer: {
                                text: `ID: ${role.id}, Role created`,
                        },
                };
        }

        guildRoleDelete = (_, guild, role) => {
                let msg = '';

                msg += `**Role Deleted**\n`;
                msg += `**Name:** ${role.name}\n`;
                msg += `**Colour:** ${'#' + role.color.toString(16)}\n`;
                msg += `**Hoisted:** ${role.hoist}\n`;
                msg += `**Created:** ${moment(role.createdAt).format('LLLL')}\n`;
                msg += `**Permissions:** ${this._formatRolePermissions(role.permissions)}`;

                return {
                        description: msg,
                        color: 'red',
                        timestamp: new Date(role.createdAt).toISOString(),
                        footer: {
                                text: `ID: ${role.id}, Role created`,
                        },
                };
        }

        guildRoleUpdate = (_, guild, role, oldRole) => {
                let msg = '';

                if (role.name !== oldRole.name) {
                        msg += `**Name:** ${oldRole.name} \`->\` ${role.name}\n`;
                }
                if (role.color !== oldRole.color) {
                        msg += `**Colour:** ${'#' + oldRole.color.toString(16)} \`->\` ${'#' + role.color.toString(16)}\n`;
                }
                if (role.hoist !== oldRole.hoist) {
                        msg += `**Hoisted:** ${oldRole.hoist} \`->\` ${role.hoist}\n`;
                }
                if (role.permissions !== oldRole.permissions) {
                        msg += `**Permissions:** ${this._formatRolePermissions(oldRole.permissions)} \`->\` ${this._formatRolePermissions(role.permissions)}\n`;
                }

                if (!msg) return;

                msg = `**Role Updated**\n` + msg;
                msg += `**Bearers:** ${guild.members.filter(m => m.roles.includes(role.id)).length}\n`;
                msg += `**Created:** ${moment(role.createdAt).format('LLLL')}`;

                return {
                        description: msg,
                        color: 'red',
                        timestamp: new Date(role.createdAt).toISOString(),
                        footer: {
                                text: `ID: ${role.id}, Role created`,
                        },
                };
        }

        _formatRolePermissions(permissions) {
                permissions = permissions.json;
                const ret = [];

                for (const perm in permissions) {
                        if (permissions[perm]) {
                                ret.push(this.permissionsMapping[perm]);
                        }
                }

                return ret.length ? ret.join(', ') : 'None';
        }
}


module.exports = Events;