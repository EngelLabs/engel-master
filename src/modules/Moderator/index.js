const { Module } = require('@timbot/core');
const ModTimer = require('require-reload')('./helpers/ModTimer', require);
const prettyMS = require('pretty-ms');


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
        warn: 'User **{user}** warned.',
};


class Moderator extends Module {
        constructor() {
                super();

                this.dbName = 'mod';
                this.aliases = ['mod', 'moderation'];
                this.info = 'Enable command-based moderation for your server';
        }

        injectHook() {
                this.tasks = [];
                this.listeners = [];

                const timerHandler = new ModTimer(this.bot);

                this.tasks.push([ timerHandler, 15000 ]);

                this.listeners.push(this.guildMemberAdd.bind(this));
        }

        async guildMemberAdd({ guildConfig, guild, member }) {
                if (guildConfig.mod?.disabled) {
                        return;
                }

                if (!await this.helpers.moderation.isMuted(guildConfig, member)) {
                        return;
                }

                return this.eris.addGuildMemberRole(guild.id, member.id, guildConfig.muteRole, 'module: Moderator');
        }

        canModerate(ctx, member, action) {
                // wrap function in curly braces to avoid returning the promise from ctx.error()
                // commands use "!ctx.module.canModerate" to decide whether to stop executing
                // and that would cause issues if a Promise was returned, which is truthy of course
                const resolve = msg => { ctx.error(msg); }

                const { author, guild, guildConfig, command } = ctx;

                const commandName = command.rootName;
                const moduleName = this.dbName;

                return this.helpers.moderation.canModerate(
                        guildConfig, guild, member, author, action, moduleName, commandName, resolve
                );
        }


        sendDM(ctx, user, msg, duration, reason) {
                if (ctx.moduleConfig && !ctx.moduleConfig.dmUser) {
                        return Promise.resolve();
                }

                if (ctx.moduleConfig?.includeDuration && duration) {
                        msg += `\nDuration: ${prettyMS(duration * 1000, { verbose: true })}`;
                }

                if (ctx.moduleConfig?.includeReason && reason?.length) {
                        msg += `\nReason: ${reason?.length ? reason : 'N/A'}`;
                }

                return this.helpers.moderation.sendDM(ctx.guildConfig, user, msg);
        }

        createModlog(ctx, type, duration, count, reason, mod, user, channel) {
                return this.helpers.moderation.createModlog(
                        ctx.guildConfig, type, duration, count, reason, user, mod, channel
                );
        }

        expireModlog(ctx, type, user, channel) {
                return this.helpers.moderation.expireModlog(
                        ctx.guild.id, user, channel, type
                );
        }

        customResponse(ctx, type, user, channel) {
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

                return ctx.success(text);
        }

        isMuted(ctx, user) {
                return this.helpers.moderation.isMuted(ctx.guildConfig, user);
        }

        purgeMessages(ctx, type, check, count, before, reason) {
                return this.helpers.moderation.purgeMessages(
                        ctx.guildConfig, ctx.channel, ctx.author,
                        type, check, count, before, reason,
                );
        }
}


module.exports = Moderator;