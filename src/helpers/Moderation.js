const { Base } = require('@timbot/core');
const prettyMS = require('pretty-ms');
const moment = require('moment');


/**
 * Moderation helper
 * @class Moderation
 * @extends Base
 */
class Moderation extends Base {
        canModerate(guildConfig, guild, member, author, action, moduleName, commandName, resolve) {
                resolve = resolve || (o => o);

                action = action || 'moderate';

                if (member.id === author?.id) {
                        return resolve(`You cannot ${action} yourself.`);
                }

                const protectedUsers = [guild.ownerID, ...this.config.users.protected];

                if (protectedUsers.includes(member.id)) {
                        return resolve('That user is protected.');
                }

                const perms = member.permissions;

                if (perms) {
                        if (perms.has('manageGuild') || perms.has('administrator')) {
                                return resolve('That user is a server admin.');
                        }

                        if (perms.has('banMembers') || perms.has('kickMembers')) {
                                return resolve('That user is a server moderator.');
                        }
                }

                if (member.roles?.length) {
                        const roles = member.guild.roles;
                        const topRole = this.getTopRole(guild);

                        if (topRole) {
                                if (member.roles.find(id => {
                                        const r = roles.get(id);

                                        return r?.position >= topRole.position;
                                })) {
                                        return resolve(`My highest role's position isn't high enough to ${action} this user.`);
                                }
                        }

                        const commandConfig = guildConfig.commands?.[commandName];
                        const moduleConfig = guildConfig[moduleName];

                        if (commandConfig?.protectedRoles?.length) {
                                const protectedRoles = commandConfig.protectedRoles;
                                if (member.roles.find(id => protectedRoles.includes(id))) {
                                        return resolve('That user is protected.');
                                }
                        } else {
                                if (moduleConfig?.protectedRoles?.length) {
                                        const protectedRoles = moduleConfig.protectedRoles;
                                        if (member.roles.find(id => protectedRoles.includes(id))) {
                                                return resolve('That user is protected.');
                                        }
                                }
                        }
                }

                return true;
        }

        deleteCommand(guildConfig, message, moduleName, commandName) {
                return new Promise(resolve => {
                        const commandConfig = guildConfig.commands?.[commandName];
                        const moduleConfig = guildConfig[moduleName];

                        const del = () => {
                                message
                                        .delete()
                                        .then(resolve)
                                        .catch(resolve);
                        }

                        if (commandConfig?.del !== undefined) {
                                return commandConfig.del ? del() : resolve();
                        } else if (moduleConfig?.delCommands !== undefined) {
                                return moduleConfig.del ? del() : resolve();
                        } else if (guildConfig.delCommands) {
                                return del();
                        }

                        resolve();
                });
        }

        sendDM(guildConfig, user, text) {
                return new Promise(resolve => {
                        user = user.user || user;

                        user.getDMChannel()
                                .then(channel => {
                                        if (!channel) {
                                                return resolve();
                                        }

                                        const embed = {
                                                description: text,
                                                color: this.config.colours.error,
                                        };

                                        channel.createMessage({ embeds: [embed] })
                                                .then(() => {
                                                        this.log(`User DM'ed U${user.id} G${guildConfig.id}.`);

                                                        resolve();
                                                })
                                                .catch(resolve);
                                })
                                .catch(resolve);
                });
        }

        resolveMuteRole(guild, guildConfig) {
                return new Promise((resolve, reject) => {
                        let role;

                        if (guildConfig.muteRole) {
                                role = guild.roles.get(guildConfig.muteRole);

                                if (role) {
                                        return resolve(role);
                                }
                        }

                        this.createMuteRole(guild, guildConfig)
                                .then(resolve)
                                .catch(reject);
                });
        }

        createMuteRole(guild, guildConfig) {
                return new Promise((resolve, reject) => {
                        this.eris.createRole(guild.id, { name: 'Muted' })
                                .then(role => {
                                        for (const channel of guild.channels.values()) {
                                                this.eris
                                                        .editChannelPermission(channel.id, role.id, 0, 3147840, 0, 'Automatic muterole creation')
                                                        .catch(() => false);
                                        }

                                        guildConfig.muteRole = role.id;

                                        this.bot.guilds.update(guild.id, { $set: { 'muteRole': role.id } });

                                        this.log(`Created mute role R${role.id} G${guild.id}.`);

                                        resolve(role);

                                })
                                .catch(() => {
                                        reject("I can't create a mute role.\nUse the `muterole set` command to set one.");
                                });
                });
        }

        createModlog(guildConfig, type, duration, count, reason, user, mod, channel) {
                return new Promise((resolve, reject) => {
                        guildConfig.caseCount = guildConfig.caseCount || 0;

                        const caseCount = guildConfig.caseCount;

                        guildConfig.caseCount++;

                        this.bot.guilds.update(guildConfig, { $inc: { caseCount: 1 } });

                        mod = {
                                id: mod.id,
                                name: mod.name || (mod.username + '#' + mod.discriminator)
                        };

                        if (user) {
                                user = {
                                        id: user.id,
                                        name: user.name || (user.username + '#' + user.discriminator)
                                };
                        }

                        if (channel) {
                                channel = {
                                        id: channel.id,
                                        name: channel.name,
                                };
                        }

                        const data = {
                                case: caseCount,
                                type: type,
                                guild: guildConfig.id,
                                mod: mod,
                        };

                        if (user) {
                                data.user = user;
                        }

                        if (channel) {
                                data.channel = channel;
                        }

                        if (reason?.length) {
                                data.reason = reason;
                        }

                        if (count) {
                                data.count = count;
                        }

                        if (duration) {
                                data.duration = duration * 1000;
                                data.expiry = Date.now() + duration * 1000;
                        }

                        this.log(`Created modlog C${caseCount} G${guildConfig.id}.`);

                        this.models.ModLog
                                .create(data)
                                .then(resolve)
                                .catch(reject);
                });
        }

        expireModlog(guild, user, channel, type) {
                return new Promise((resolve, reject) => {
                        const filter = {
                                guild: guild,
                                type: type,
                        };

                        if (user) {
                                filter['user.id'] = user.id;
                        }

                        if (channel) {
                                filter['channel.id'] = channel.id;
                        }

                        this.models.ModLog
                                .updateMany(filter, { $unset: { expiry: null } })
                                .exec()
                                .then(resolve)
                                .catch(reject);
                });
        }

        formatModlog(m, includeUser = true, includeChannel = true) {
                let msg = '';

                msg += `**Case:** ${m.case}\n`;
                msg += `**Type:** ${m.type}\n`

                if (m.duration) {
                        msg += `**Duration:** ${prettyMS(m.duration)}\n`;
                        msg += `**Active:** ${m.expiry > Date.now() ? 'true' : 'false'}\n`;
                }

                if (m.count) {
                        msg += `**Count:** ${m.count}\n`;
                }

                msg += `**Created:** ${moment(m.created).format('LLLL')}\n`;

                if (includeUser && m.user) {
                        msg += `**User:** ${m.user.name} (${m.user.id})\n`;
                }

                if (includeChannel && m.channel) {
                        msg += `**Channel:** ${m.channel.name} (${m.channel.id})\n`;
                }

                msg += `**Moderator:** ${m.mod.name} (${m.mod.id})\n`;

                if (m.reason?.length) {
                        msg += `**Reason:** ${m.reason}\n`;
                }

                return msg;
        }

        async isMuted(guildConfig, user) {
                if (!guildConfig.muteRole) {
                        return false;
                }

                if (user.roles?.includes?.(guildConfig.muteRole)) {
                        return true;
                }

                const currentMute = await this.models.ModLog
                        .findOne({ guild: guildConfig.id, 'user.id': user.id, type: 'mute', expiry: { $gt: Date.now() } });

                if (currentMute) {
                        return true;
                }

                return false;
        }

        purgeMessages(guildConfig, channel, mod, type, check, count, before, reason) {
                return new Promise((resolve, reject) => {
                        const limit = parseInt(count || 100, 10);

                        if (isNaN(limit) || limit < 1 || limit > 1000) {
                                return reject(`Count \`${count}\` is invalid. It must be a number between 1-1000`);
                        }

                        check = check || (() => true);

                        const opts = { limit };

                        if (before) {
                                opts.before = before;
                        }

                        this.eris.getMessages(channel.id, opts)
                                .then(messages => {
                                        messages = messages
                                                .filter(msg => {
                                                        if (msg.pinned) return false;
                                                        if ((Date.now() - msg.timestamp) > (14 * 24 * 60 * 60 * 1000)) return false;

                                                        return check(msg);
                                                })
                                                .map(m => m.id);

                                        if (!messages.length) {
                                                return resolve();
                                        }

                                        const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${mod.id}`;

                                        this.eris.deleteMessages(channel.id, messages, auditReason)
                                                .then(() => {
                                                        this.log(`Purged "${count}" messages C${channel.id} G${guildConfig.id}.`);

                                                        this.createModlog(
                                                                guildConfig,
                                                                type,
                                                                null,
                                                                limit,
                                                                reason,
                                                                null,
                                                                mod,
                                                                channel,
                                                        );

                                                        resolve();
                                                })
                                                .catch(resolve);
                                })
                                .catch(resolve);
                });
        }
}


module.exports = Moderation;