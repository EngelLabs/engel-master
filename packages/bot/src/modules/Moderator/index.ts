import * as eris from 'eris';
import * as prettyMS from 'pretty-ms';
import type * as types from '@engel/types';
import Module from '../../core/structures/Module';
import Moderation from '../../core/helpers/Moderation';
import type _ModTimer from './helpers/ModTimer';
import type Context from '../../core/structures/Context';

const ModTimer: typeof _ModTimer = require('require-reload')('./helpers/ModTimer', require).default;

const defaultResponses: Record<string, string> = {
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

export default class Moderator extends Module {
        private _moderation: Moderation;

        public constructor() {
                super();

                this.dbName = 'mod';
                this.aliases = ['mod', 'moderation'];
                this.info = 'Enable command-based moderation for your server';
        }

        public injectHook() {
                this._moderation = new Moderation(this.core);

                this.tasks = [];
                this.listeners = [];

                const timerHandler = (new ModTimer(this.core)).handler;

                this.tasks.push([timerHandler, 15000]);

                this.listeners.push(this.guildMemberAdd.bind(this));
        }

        private async guildMemberAdd(p: any) {
                const {
                        guildConfig,
                        guild,
                        member
                }: {
                        guildConfig: types.GuildConfig,
                        guild: eris.Guild,
                        member: eris.Member,
                } = p;

                if (!guildConfig) return;

                if (guildConfig.modules?.mod?.disabled) {
                        return;
                }

                if (!await this._moderation.isMuted(guildConfig, member)) {
                        return;
                }

                return this.eris.addGuildMemberRole(guild.id, member.id, guildConfig.muteRole, 'module: Moderator');
        }

        public canModerate(ctx: Context, member: eris.Member | eris.User, action: string): boolean {
                // wrap function in curly braces to avoid returning the promise from ctx.error()
                // commands use "!ctx.module.canModerate" to decide whether to stop executing
                // and that would cause issues if a Promise was returned, which is truthy of course
                const resolve = (msg: string) => { ctx.error(msg); };

                const { author, guild, guildConfig, command } = ctx;

                const commandName = command.rootName;
                const moduleName = this.dbName;

                if (!this._moderation.canModerate(guild, member, author, action, resolve)) {
                        return false;
                }

                const commandConfig = guildConfig.commands?.[commandName];
                const moduleConfig = guildConfig.modules?.[moduleName];

                if (member instanceof eris.Member) {
                        // TODO: Type the stuff below
                        // @ts-ignore
                        if (typeof commandConfig !== 'boolean' && commandConfig?.protectedRoles?.length) {
                                // @ts-ignore
                                const protectedRoles = commandConfig.protectedRoles;
                                if (member.roles.find(id => protectedRoles.includes(id))) {
                                        resolve('That user is protected.');

                                        return false;
                                }
                        } else {
                                // @ts-ignore
                                if (moduleConfig?.protectedRoles?.length) {
                                        // @ts-ignore
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

        public sendDM(ctx: Context, user: eris.Member | eris.User, msg: string, duration?: number, reason?: string) {
                // TODO: Type all the stuff below

                // @ts-ignore
                if (ctx.moduleConfig && !ctx.moduleConfig.dmUser) {
                        return Promise.resolve();
                }

                // @ts-ignore
                if (ctx.moduleConfig?.includeDuration && duration) {
                        msg += `\nDuration: ${prettyMS(duration * 1000, { verbose: true })}`;
                }

                // @ts-ignore
                if (ctx.moduleConfig?.includeReason && reason?.length) {
                        msg += `\nReason: ${reason?.length ? reason : 'N/A'}`;
                }

                return this._moderation.sendDM(ctx.guildConfig, user, msg);
        }

        public createModlog(
                ctx: Context,
                type: string,
                duration: number | null,
                count: number | null,
                reason: string,
                mod: eris.User | eris.Member,
                user: eris.User | eris.Member | null,
                channel: eris.GuildChannel | null
        ): Promise<void> {
                return this._moderation.createModlog(
                        ctx.guildConfig, type, duration, count, reason, mod, user, channel
                );
        }

        public expireModlog(
                ctx: Context,
                type: string,
                user: eris.User | eris.Member,
                channel: eris.GuildChannel
        ): Promise<void> {
                return this._moderation.expireModlog(
                        ctx.guild.id, user, channel, type
                );
        }

        public async customResponse(
                ctx: Context,
                type: string,
                user: eris.User | eris.Member | null,
                channel: eris.GuildChannel | null
        ): Promise<void> {
                let text: string;

                if (ctx.guildConfig.isPremium) {
                        // TODO: Type this
                        // @ts-ignore
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

        public isMuted(ctx: Context, user: eris.Member | eris.User): Promise<boolean> {
                return this._moderation.isMuted(ctx.guildConfig, user);
        }

        public purgeMessages(
                ctx: Context,
                type: string,
                check?: (m: eris.Message<eris.TextChannel>) => boolean,
                count?: string | number,
                before?: string,
                reason?: string
        ): Promise<void> {
                return this._moderation.purgeMessages(
                        ctx.guildConfig, (<eris.TextChannel>ctx.channel), ctx.author,
                        type, check, count, before, reason
                );
        }
}