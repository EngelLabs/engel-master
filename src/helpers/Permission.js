const Base = require('../core/structures/Base');


/**
 * Permissions helper
 * @class Permission
 * @extends Base
 */
class Permission extends Base {
        _name = 'permissions';
        
        isOwner(ctx) {
                return ctx.author.id === ctx.guild.ownerID;
        }

        isServerAdmin(ctx) {
                const perms = ctx.member.permissions;

                return perms.has('manageGuild') || perms.has('administrator');
        }

        isAdmin(userID) {
                const config = this.config;

                return userID === config.author.id || config.developers.includes(userID);
        }

        isTester(userID) {
                return this.config.users.testers.includes(userID);
        }

        canInvoke(ctx) {
                const roles = ctx.member?.roles,
                        channel = ctx.channel;

                let canInvoke = false,
                        overrideExists = false;

                const checkPerms = c => {
                        if (!c) return false;

                        if (c.allowedRoles && c.allowedRoles.length) {
                                if (!overrideExists) overrideExists = true;

                                if (!c.allowedRoles.find(id => roles.includes(id))) return false;
                        }

                        if (c.allowedChannels && c.allowedChannels.length) {
                                if (!overrideExists) overrideExists = true;

                                if (!c.allowedChannels.find(id => id === channel.id)) return false;
                        }

                        if (c.ignoredRoles && c.ignoredRoles.length) {
                                if (!overrideExists) overrideExists = true;

                                if (c.ignoredRoles.find(id => roles.includes(id))) return false;
                        }

                        if (c.ignoredChannels && c.ignoredChannels.length) {
                                if (!overrideExists) overrideExists = true;

                                if (c.ignoredChannels.find(id => id === channel.id)) return false;
                        }

                        if (overrideExists) return true;

                        return false;
                }

                canInvoke = checkPerms(ctx.commandConfig);

                if (!canInvoke && !overrideExists) {
                        canInvoke = checkPerms(ctx.moduleConfig);
                }

                if (!canInvoke && !overrideExists) {
                        canInvoke = checkPerms(ctx.guildConfig);
                }

                if (!overrideExists && ctx.module.allowedByDefault) {
                        return true;
                }

                return canInvoke;
        }

        hasGuildPermissions(guild, ...requiredPerms) {
                const permissions = guild.permissionsOf(this.eris.user.id);

                for (const perm of requiredPerms) {
                        if (!permissions.has(perm)) return false;
                }

                return true;
        }
}


module.exports = Permission;