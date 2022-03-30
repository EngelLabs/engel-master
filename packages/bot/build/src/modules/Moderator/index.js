"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const prettyMS = require("pretty-ms");
const Module_1 = require("../../core/structures/Module");
const Moderation_1 = require("../../core/helpers/Moderation");
const ModTimer = require('require-reload')('./helpers/ModTimer', require).default;
const defaultResponses = {
    ban: 'User **{user}** banned.',
    block: 'User **{user}** blocked from **{channel}**.',
    kick: 'User **{user}** kicked.',
    lock: 'Channel **{channel}** locked.',
    mute: 'User **{user}** muted.',
    unban: 'User **{user}** unbanned.',
    unblock: 'User **{user}** unblocked from **{channel}**.',
    unlock: 'Channel **{channel}** unlocked.',
    unmute: 'User **{user}** unmuted.',
    warn: 'User **{user}** warned.'
};
class Moderator extends Module_1.default {
    _moderation;
    constructor() {
        super();
        this.dbName = 'mod';
        this.aliases = ['mod', 'moderation'];
        this.info = 'Enable command-based moderation for your server';
    }
    injectHook() {
        this._moderation = new Moderation_1.default(this.app);
        this.tasks = [];
        this.listeners = [];
        const timerHandler = (new ModTimer(this.app)).handler;
        this.tasks.push([timerHandler, 15000]);
        this.listeners.push(this.guildMemberAdd.bind(this));
    }
    async guildMemberAdd(p) {
        const { guildConfig, guild, member, isTester, isTesting, isAdmin } = p;
        if (!guildConfig)
            return;
        if (!this.isEnabled(guildConfig)) {
            return;
        }
        if (member.id === this.eris.user.id) {
            return;
        }
        if (isAdmin) {
            return;
        }
        if (this.baseConfig.dev && (!isTester || !isTesting)) {
            return;
        }
        if (!await this._moderation.isMuted(guildConfig, member)) {
            return;
        }
        return this.eris.addGuildMemberRole(guild.id, member.id, guildConfig.muteRole, 'module: Moderator');
    }
    canModerate(ctx, member, action) {
        const resolve = (msg) => { ctx.error(msg); };
        const { author, guild, guildConfig, command } = ctx;
        const commandName = command.rootName;
        const moduleName = this.dbName;
        if (!this._moderation.canModerate(guild, member, author, action, resolve)) {
            return false;
        }
        const commandConfig = guildConfig.commands?.[commandName];
        const moduleConfig = guildConfig.modules?.[moduleName];
        if (member instanceof eris.Member) {
            if (typeof commandConfig !== 'boolean' && commandConfig?.protectedRoles?.length) {
                const protectedRoles = commandConfig.protectedRoles;
                if (member.roles.find(id => protectedRoles.includes(id))) {
                    resolve('That user is protected.');
                    return false;
                }
            }
            else {
                if (moduleConfig?.protectedRoles?.length) {
                    const protectedRoles = moduleConfig.protectedRoles;
                    if (member.roles.find(id => protectedRoles.includes(id))) {
                        resolve('That user is protected.');
                        return false;
                    }
                }
            }
        }
        return true;
    }
    sendDM(ctx, user, msg, duration, reason) {
        const moduleConfig = ctx.moduleConfig;
        if (moduleConfig && !moduleConfig.dmUser) {
            return Promise.resolve();
        }
        if (moduleConfig?.includeDuration && duration) {
            msg += `\nDuration: ${prettyMS(duration * 1000, { verbose: true })}`;
        }
        if (moduleConfig?.includeReason && reason?.length) {
            msg += `\nReason: ${reason?.length ? reason : 'N/A'}`;
        }
        return this._moderation.sendDM(ctx.guildConfig, user, msg);
    }
    createModlog(ctx, type, duration, count, reason, mod, user, channel) {
        return this._moderation.createModlog(ctx.guildConfig, type, duration, count, reason, mod, user, channel);
    }
    expireModlog(ctx, type, user, channel) {
        return this._moderation.expireModlog(ctx.guild.id, user, channel, type);
    }
    async customResponse(ctx, type, user, channel) {
        let text;
        if (ctx.guildConfig.isPremium) {
            text = ctx.moduleConfig?.responses?.[type];
        }
        text = text || defaultResponses[type];
        const mod = ctx.author;
        text = text.replace('{mod}', mod.username + '#' + mod.discriminator);
        if (user) {
            text = text.replace('{user}', user.username + '#' + user.discriminator);
        }
        if (channel) {
            text = text.replace('{channel}', '#' + channel.name);
        }
        await ctx.success(text);
    }
    isMuted(ctx, user) {
        return this._moderation.isMuted(ctx.guildConfig, user);
    }
    purgeMessages(ctx, type, check, count, before, reason) {
        return this._moderation.purgeMessages(ctx.guildConfig, ctx.channel, ctx.author, type, check, count, before, reason);
    }
}
exports.default = Moderator;
//# sourceMappingURL=index.js.map