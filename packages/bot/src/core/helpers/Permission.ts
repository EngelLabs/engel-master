import Base from '../structures/Base';
import type * as eris from 'eris';
import type * as types from '@engel/types';
import type Context from '../structures/Context';

/**
 * Permissions helper
 */
export default class Permission extends Base {
        public isOwner(ctx: Context): boolean {
                return ctx.author.id === ctx.guild.ownerID;
        }

        public isServerAdmin(ctx: Context): boolean {
                const perms = ctx.member.permissions;

                return perms.has('manageGuild') || perms.has('administrator');
        }

        public isAdmin(userID: string): boolean {
                const config = this.config;

                return userID === config.author.id || config.users.developers.includes(userID);
        }

        public isTester(userID: string): boolean {
                return this.config.users.testers.includes(userID);
        }

        public canInvoke(ctx: Context): boolean {
                const roles = ctx.member?.roles,
                        channel = ctx.channel;

                let canInvoke = false,
                        overrideExists = false;

                const checkPerms = (c: types.BaseConfig): boolean => {
                        if (!c || typeof c === 'boolean') return false;

                        if (c.allowedRoles?.length) {
                                if (!overrideExists) overrideExists = true;

                                if (!c.allowedRoles.find((id: string) => roles.includes(id))) return false;
                        }

                        if (c.allowedChannels?.length) {
                                if (!overrideExists) overrideExists = true;

                                if (!c.allowedChannels.find((id: string) => id === channel.id)) return false;
                        }

                        if (c.ignoredRoles?.length) {
                                if (!overrideExists) overrideExists = true;

                                if (c.ignoredRoles.find((id: string) => roles.includes(id))) return false;
                        }

                        if (c.ignoredChannels?.length) {
                                if (!overrideExists) overrideExists = true;

                                if (c.ignoredChannels.find((id: string) => id === channel.id)) return false;
                        }

                        if (overrideExists) return true;

                        return false;
                };

                canInvoke = checkPerms(<types.CommandConfig>ctx.commandConfig);

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

        public hasGuildPermissions(guild: eris.Guild, ...requiredPerms: Array<keyof eris.Constants['Permissions']>) {
                const permissions = guild.permissionsOf(this.eris.user.id);

                for (const perm of requiredPerms) {
                        if (!permissions.has(perm)) return false;
                }

                return true;
        }
}
