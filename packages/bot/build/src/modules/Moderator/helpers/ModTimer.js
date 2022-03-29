"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const Base_1 = require("../../../core/structures/Base");
const Permission_1 = require("../../../core/helpers/Permission");
const Moderation_1 = require("../../../core/helpers/Moderation");
class ModTimer extends Base_1.default {
    _permissions;
    _moderation;
    constructor(core) {
        super(core);
        this._permissions = new Permission_1.default(core);
        this._moderation = new Moderation_1.default(core);
    }
    get handler() {
        return this._handle.bind(this);
    }
    async _handle() {
        try {
            var modlogs = await this.models.ModLog.find({ expiry: { $lte: Date.now() } });
        }
        catch (err) {
            this.log(err, 'error');
            return;
        }
        if (!modlogs || !modlogs.length)
            return;
        for (const modlog of modlogs) {
            try {
                const key = modlog.type.split(' ')[0];
                if (typeof this[key] === 'function') {
                    this[key](modlog);
                    this.log(`${key} timer handled G${modlog.guild}.`);
                    this.models.ModLog
                        .updateOne({ _id: modlog._id }, { $unset: { expiry: null } })
                        .exec();
                }
                else {
                    this.log(`Skipping unknown timer ${key}`);
                }
            }
            catch (err) {
                this.log(err, 'error');
            }
        }
    }
    async mute({ guild: guildID, user }) {
        const guild = this.eris.guilds.get(guildID);
        if (!guild)
            return;
        if (!this._permissions.hasGuildPermissions(guild, 'manageRoles'))
            return;
        const guildConfig = await this.core.guilds.getOrFetch(guild.id);
        if (!guildConfig || !this._isEnabled(guildConfig))
            return;
        const muteRole = guildConfig.muteRole;
        if (!muteRole)
            return;
        const member = guild.members.get(user.id);
        this._moderation.createModlog(guildConfig, 'unmute [Auto]', null, null, null, this.eris.user, member, null);
        if (member?.roles?.includes?.(muteRole)) {
            this.eris.removeGuildMemberRole(guild.id, member.id, muteRole, 'module: Moderator. Auto unmute')
                .catch(() => false);
        }
    }
    async ban({ guild: guildID, user }) {
        const guild = this.eris.guilds.get(guildID);
        if (!guild)
            return;
        if (!this._permissions.hasGuildPermissions(guild, 'banMembers'))
            return;
        const guildConfig = await this.core.guilds.getOrFetch(guild.id);
        if (!guildConfig || !this._isEnabled(guildConfig))
            return;
        this.eris.unbanGuildMember(guild.id, user.id, 'module: Moderator. Auto unban')
            .then(() => {
            this._moderation.createModlog(guildConfig, 'unban [Auto]', null, null, null, this.eris.user, user, null);
        })
            .catch(() => false);
    }
    async lock({ guild: guildID, channel }) {
        const guild = this.eris.guilds.get(guildID);
        if (!guild)
            return;
        const actualChannel = guild.channels.get(channel.id);
        if (!actualChannel)
            return;
        if (!this._permissions.hasGuildPermissions(guild, 'manageChannels', 'manageRoles'))
            return;
        const guildConfig = await this.core.guilds.getOrFetch(guild.id);
        if (!guildConfig || !this._isEnabled(guildConfig))
            return;
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
            this._moderation.createModlog(guildConfig, 'unlock [Auto]', null, null, null, this.eris.user, null, channel);
        })
            .catch(() => false);
    }
    async block({ guild: guildID, channel, user }) {
        const guild = this.eris.guilds.get(guildID);
        if (!guild)
            return;
        const actualChannel = guild.channels.get(channel.id);
        if (!channel)
            return;
        if (!this._permissions.hasGuildPermissions(guild, 'manageChannels', 'manageRoles'))
            return;
        const guildConfig = await this.core.guilds.getOrFetch(guild.id);
        if (!guildConfig || !this._isEnabled(guildConfig))
            return;
        const overwrite = actualChannel.permissionOverwrites.get(user.id);
        const allow = overwrite?.allow || BigInt(0);
        let deny = overwrite?.deny || BigInt(0);
        if (overwrite?.json?.viewChannel === false) {
            deny ^= eris.Constants.Permissions.viewChannel;
        }
        else {
            return;
        }
        this.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, 'module: Moderator. Automatic unblock')
            .then(() => {
            this._moderation.createModlog(guildConfig, 'unblock [Auto]', null, null, null, this.eris.user, user, channel);
        })
            .catch(() => false);
    }
    _isEnabled(guildConfig) {
        if (!guildConfig || !guildConfig.modules || guildConfig.modules.mod) {
            return true;
        }
        return !guildConfig.modules.mod.disabled;
    }
}
exports.default = ModTimer;
//# sourceMappingURL=ModTimer.js.map