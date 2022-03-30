"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const prettyMS = require("pretty-ms");
const moment = require("moment");
const Base_1 = require("../structures/Base");
class Moderation extends Base_1.default {
    canModerate(guild, member, author, action, resolve) {
        resolve = resolve || ((..._) => false);
        action = action || 'moderate';
        if (member.id === author?.id) {
            return resolve(`You cannot ${action} yourself.`);
        }
        const protectedUsers = [guild.ownerID, ...this.config.users.protected];
        if (protectedUsers.includes(member.id)) {
            return resolve('That user is protected.');
        }
        if (member instanceof eris.Member) {
            const perms = member.permissions;
            if (perms.has('manageGuild') || perms.has('administrator')) {
                return resolve('That user is a server admin.');
            }
            if (perms.has('banMembers') || perms.has('kickMembers')) {
                return resolve('That user is a server moderator.');
            }
            if (member.roles.length) {
                const roles = member.guild.roles;
                const topRole = this.utils.getTopRole(guild);
                if (topRole) {
                    if (member.roles.find(id => {
                        const r = roles.get(id);
                        return r?.position >= topRole.position;
                    })) {
                        return resolve(`My highest role's position isn't high enough to ${action} this user.`);
                    }
                }
            }
        }
        return true;
    }
    sendDM(guildConfig, user, text) {
        return new Promise(resolve => {
            user = user instanceof eris.Member ? user.user : user;
            user.getDMChannel()
                .then(channel => {
                if (!channel) {
                    return resolve();
                }
                const embed = {
                    description: text,
                    color: this.config.colours.error
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
    createModlog(guildConfig, type, duration, count, reason, mod, user, channel) {
        return new Promise((resolve, reject) => {
            guildConfig.caseCount = guildConfig.caseCount || 0;
            const caseCount = guildConfig.caseCount;
            guildConfig.caseCount++;
            this.app.guilds.update(guildConfig, { $inc: { caseCount: 1 } });
            mod = {
                id: mod.id,
                name: (mod instanceof eris.User || mod instanceof eris.Member)
                    ? (mod.username + '#' + mod.discriminator)
                    : mod.name
            };
            if (user) {
                user = {
                    id: user.id,
                    name: (user instanceof eris.User || user instanceof eris.Member)
                        ? (user.username + '#' + user.discriminator)
                        : user.name
                };
            }
            if (channel) {
                channel = {
                    id: channel.id,
                    name: channel.name
                };
            }
            const data = {
                case: caseCount,
                type: type,
                guild: guildConfig.id,
                mod: mod
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
                .then(() => resolve())
                .catch(reject);
        });
    }
    expireModlog(guild, user, channel, type) {
        return new Promise((resolve, reject) => {
            const filter = {
                guild: guild,
                type: type
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
                .then(() => resolve())
                .catch(reject);
        });
    }
    formatModlog(m, includeUser = true, includeChannel = true) {
        let msg = '';
        msg += `**Case:** ${m.case}\n`;
        msg += `**Type:** ${m.type}\n`;
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
        if (user instanceof eris.Member && user.roles.includes(guildConfig.muteRole)) {
            return true;
        }
        const currentMute = await this.models.ModLog
            .findOne({ guild: guildConfig.id, 'user.id': user.id, type: 'mute', expiry: { $gt: Date.now() } })
            .lean();
        if (currentMute) {
            return true;
        }
        return false;
    }
    purgeMessages(guildConfig, channel, mod, type, check, count, before, reason) {
        return new Promise((resolve, reject) => {
            const limit = typeof count !== 'number'
                ? parseInt(count || '100', 10)
                : count;
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
                const toDelete = messages
                    .filter((msg) => {
                    if (msg.pinned)
                        return false;
                    if ((Date.now() - msg.timestamp) > (14 * 24 * 60 * 60 * 1000))
                        return false;
                    return check(msg);
                })
                    .map(m => m.id);
                if (!toDelete.length) {
                    return resolve();
                }
                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${mod.id}`;
                this.eris.deleteMessages(channel.id, toDelete, auditReason)
                    .then(() => {
                    this.log(`Purged "${count}" messages C${channel.id} G${guildConfig.id}.`);
                    this.createModlog(guildConfig, type, null, limit, reason, mod, null, channel);
                    resolve();
                    return null;
                })
                    .catch(resolve);
            })
                .catch(resolve);
        });
    }
}
exports.default = Moderation;
//# sourceMappingURL=Moderation.js.map