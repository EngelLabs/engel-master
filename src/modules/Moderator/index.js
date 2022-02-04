const Module = require('../../core/structures/Module');
const ModTimer = require('require-reload')('./helpers/ModTimer', require);
const prettyMS = require('pretty-ms');

const defaultResponses = {
        ban: 'User **{user}** banned.',
        kick: 'User **{user}** kicked.',
};


class Moderator extends Module {
        constructor() {
                super();

                this.dbName = 'mod';
                this.aliases = ['mod', 'moderation'];
                this.info = 'Enable command-based moderation for your server';
        }

        injectHook() {
                const timerHandler = new ModTimer(this.bot);

                this.tasks = [
                        [timerHandler, 15000],
                ];
        }

        canModerate(ctx, member, action) {
                const resolve = msg => { ctx.error(msg); }
                
                const { author, guild, guildConfig, command } = ctx;

                const commandName = command.rootName;
                const moduleName = this.dbName;

                return this.helpers.moderation.canModerate(
                        guildConfig, guild, member, author, action, commandName, moduleName, resolve
                );
        }
 

        sendDM(ctx, user, msg, duration, reason) {
                if (!ctx.moduleConfig || !ctx.moduleConfig.dmUser) {
                        return Promise.resolve();
                }

                if (duration) {
                        msg += `\nDuration: ${prettyMS(duration * 1000, { verbose: true })}.`;
                }

                if (ctx.moduleConfig.includeReason && reason !== null) {
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
                return this.helpers.moderation.expireModeration(
                        ctx.guild, user, channel, type
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

        isMuted(ctx, member) {
                return this.helpers.moderation.isMuted(ctx.guildConfig, member);
        }

        purgeMessages(ctx, type, check, count, before, reason) {
                return this.helpers.moderation.purgeMessages(
                        ctx.guildConfig, ctx.channel, ctx.author,
                        type, check, count, before, reason,
                );
        }
}


module.exports = Moderator;