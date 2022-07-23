import * as eris from 'eris';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import Base from '../../../core/structures/Base';
import Permission from '../../../core/helpers/Permission';
import Moderation from '../../../core/helpers/Moderation';
import type Moderator from '..';

type TimerTypes = 'mute' | 'ban' | 'lock' | 'block';

/**
 * Moderation timer handler
 */
export default class ModTimer extends Base {
        private _permissions: Permission;
        private _moderation: Moderation;
        private _logger: core.Logger;

        public constructor(module: Moderator) {
                super(module.app);

                this._logger = module.logger.get('ModTimer');
                this._permissions = new Permission(this.app);
                this._moderation = new Moderation(this.app);
        }

        public get handler(): () => Promise<void> {
                return this._handle.bind(this);
        }

        /**
         * Find and handle expired timers
         */
        private async _handle(): Promise<void> {
                try {
                        var modlogs = await this.models.ModLog.find({ expiry: { $lte: Date.now() } });
                } catch (err) {
                        this._logger.error(err);

                        return;
                }

                if (!modlogs || !modlogs.length) return;

                for (const modlog of modlogs) {
                        try {
                                const key = <TimerTypes>modlog.type.split(' ')[0];

                                if (typeof this[key] === 'function') {
                                        this[key](modlog);

                                        this._logger.debug(`${key} timer handled G${modlog.guild}.`);
                                        this.models.ModLog
                                                .updateOne({ _id: modlog._id }, { $unset: { expiry: null } })
                                                .exec();
                                } else {
                                        this._logger.debug(`Skipping unknown timer ${key}`);
                                }
                        } catch (err) {
                                this._logger.error(err);
                        }
                }
        }

        public async mute({ guild: guildID, user }: types.ModLog): Promise<void> {
                const guild = this.eris.guilds.get(guildID);

                if (!guild) return;

                if (!this._permissions.hasGuildPermissions(guild, 'manageRoles')) return;

                const guildConfig = await this.app.guilds.getOrFetch(guild.id);
                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                const muteRole = guildConfig.muteRole;
                if (!muteRole) return;

                const member = guild.members.get(user.id);

                this._moderation.createModlog(
                        guildConfig,
                        'unmute [Auto]',
                        null,
                        null,
                        null,
                        this.eris.user,
                        member,
                        null
                );

                if (member?.roles?.includes?.(muteRole)) {
                        this.eris.removeGuildMemberRole(guild.id, member.id, muteRole, 'module: Moderator. Auto unmute')
                                .catch(() => false);
                }
        }

        public async ban({ guild: guildID, user }: types.ModLog): Promise<void> {
                const guild = this.eris.guilds.get(guildID);

                if (!guild) return;

                if (!this._permissions.hasGuildPermissions(guild, 'banMembers')) return;

                const guildConfig = await this.app.guilds.getOrFetch(guild.id);

                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                this.eris.unbanGuildMember(guild.id, user.id, 'module: Moderator. Auto unban')
                        .then(() => {
                                this._moderation.createModlog(
                                        guildConfig,
                                        'unban [Auto]',
                                        null,
                                        null,
                                        null,
                                        this.eris.user,
                                        user,
                                        null
                                );
                        })
                        .catch(() => false);
        }

        public async lock({ guild: guildID, channel }: types.ModLog): Promise<void> {
                const guild = this.eris.guilds.get(guildID);

                if (!guild) return;

                const actualChannel = guild.channels.get(channel.id);

                if (!actualChannel) return;

                if (!this._permissions.hasGuildPermissions(guild, 'manageChannels', 'manageRoles')) return;

                const guildConfig = await this.app.guilds.getOrFetch(guild.id);

                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                const overwrite = actualChannel.permissionOverwrites.get(guild.id);

                const allow = overwrite.allow || BigInt(0);

                let deny = overwrite.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

                        if (perms.sendMessages === false) {
                                deny ^= eris.Constants.Permissions.sendMessages;
                        }
                        if (perms.addReactions === false) {
                                deny ^= eris.Constants.Permissions.addReactions;
                        }
                        if (perms.voiceConnect === false) {
                                deny ^= eris.Constants.Permissions.voiceConnect;
                        }
                        if (perms.voiceSpeak === false) {
                                deny ^= eris.Constants.Permissions.voiceSpeak;
                        }
                }

                this.eris.editChannelPermission(channel.id, guild.id, allow, deny, 0, 'module: Moderator. Automatic unlock')
                        .then(() => {
                                this._moderation.createModlog(
                                        guildConfig,
                                        'unlock [Auto]',
                                        null,
                                        null,
                                        null,
                                        this.eris.user,
                                        null,
                                        channel
                                );
                        })
                        .catch(() => false);
        }

        public async block({ guild: guildID, channel, user }: types.ModLog): Promise<void> {
                const guild = this.eris.guilds.get(guildID);

                if (!guild) return;

                const actualChannel = guild.channels.get(channel.id);

                if (!channel) return;

                if (!this._permissions.hasGuildPermissions(guild, 'manageChannels', 'manageRoles')) return;

                const guildConfig = await this.app.guilds.getOrFetch(guild.id);

                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                const overwrite = actualChannel.permissionOverwrites.get(user.id);

                const allow = overwrite?.allow || BigInt(0);

                let deny = overwrite?.deny || BigInt(0);

                if (overwrite?.json?.viewChannel === false) {
                        deny ^= eris.Constants.Permissions.viewChannel;
                } else {
                        return;
                }

                this.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, 'module: Moderator. Automatic unblock')
                        .then(() => {
                                this._moderation.createModlog(
                                        guildConfig,
                                        'unblock [Auto]',
                                        null,
                                        null,
                                        null,
                                        this.eris.user,
                                        user,
                                        channel
                                );
                        })
                        .catch(() => false);
        }

        private _isEnabled(guildConfig: types.Guild): boolean {
                if (!guildConfig || !guildConfig.modules || guildConfig.modules.mod) {
                        return true;
                }

                return !guildConfig.modules.mod.disabled;
        }
}
