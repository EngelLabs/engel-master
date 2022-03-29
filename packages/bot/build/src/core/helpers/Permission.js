"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../structures/Base");
class Permission extends Base_1.default {
    isOwner(guild, user) {
        return guild.ownerID === this._userID(user);
    }
    isServerAdmin(guild, user) {
        const perms = guild.permissionsOf(this._userID(user));
        return perms.has('manageGuild') || perms.has('administrator');
    }
    isAdmin(user) {
        const config = this.config;
        const userID = this._userID(user);
        return userID === config.author.id || config.users.developers.includes(userID);
    }
    isTester(user) {
        return this.config.users.testers.includes(this._userID(user));
    }
    hasGuildPermissions(guild, user, ...requiredPerms) {
        const permissions = guild.permissionsOf(this._userID(user));
        for (const perm of requiredPerms) {
            if (!permissions.has(perm))
                return false;
        }
        return true;
    }
    _userID(user) {
        return typeof user === 'string' ? user : user.id;
    }
}
exports.default = Permission;
//# sourceMappingURL=Permission.js.map