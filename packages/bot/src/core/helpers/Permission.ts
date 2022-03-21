import Base from '../structures/Base';
import type * as eris from 'eris';

/**
 * Permissions helper
 */
export default class Permission extends Base {
        public isOwner(guild: eris.Guild, user: eris.Uncached | string): boolean {
                return guild.ownerID === this._userID(user);
        }

        public isServerAdmin(guild: eris.Guild, user: eris.Uncached | string): boolean {
                const perms = guild.permissionsOf(this._userID(user));

                return perms.has('manageGuild') || perms.has('administrator');
        }

        public isAdmin(user: eris.Uncached | string): boolean {
                const config = this.config;

                const userID = this._userID(user);

                return userID === config.author.id || config.users.developers.includes(userID);
        }

        public isTester(user: eris.Uncached | string): boolean {
                return this.config.users.testers.includes(this._userID(user));
        }

        public hasGuildPermissions(guild: eris.Guild, user: eris.Uncached | string, ...requiredPerms: Array<keyof eris.Constants['Permissions']>) {
                const permissions = guild.permissionsOf(this._userID(user));

                for (const perm of requiredPerms) {
                        if (!permissions.has(perm)) return false;
                }

                return true;
        }

        private _userID(user: eris.Uncached | string): string {
                return typeof user === 'string' ? user : user.id;
        }
}
