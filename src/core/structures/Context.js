const Base = require('./Base');


/**
 * Represents a command's execution context.
 * @class Context
 */
class Context extends Base {
        constructor(bot, options) {
                super(bot);

                Object.assign(this, options);
        }

        get guild() {
                return this.message.channel.guild;
        }

        get channel() {
                return this.message.channel;
        }

        get author() {
                return this.message.author;
        }

        get member() {
                return this.message.member;
        }

        get me() {
                return this.guild?.members?.get?.(this.eris.user.id);
        }

        get permissions() {
                return this.channel.permissionsOf?.(this.eris.user.id);
        }

        get topRole() {
                return this.getTopRole(this.guild);
        }

        get moduleConfig() {
                return this.guildConfig[this.module.dbName];
        }

        set moduleConfig(config) {
                this.guildConfig[this.module.dbName] = config;
        }

        get commandConfig() {
                return this.guildConfig.commands?.[this.command.rootName];
        }

        set commandConfig(config) {
                this.guildConfig.commands = this.guildConfig.commands || {};
                this.guildConfig.commands[this.command.rootName] = config;
        }

        log(msg, level = 'debug', prefix) {
                prefix = prefix || this.command.dbName;

                return super.log(msg, level, `Commands.${prefix}`);
        }

        send(options, ...args) {
                if (!options) return Promise.resolve();

                if (options.embed) {
                        if (!options.embeds) options.embeds = [];

                        if (options.embed.colour && !options.embed.color) {
                                options.embed.color = options.embed.colour;
                                delete options.embed.colour;
                        }

                        options.embeds.push(options.embed);

                        delete options.embed;
                }

                if (this.guild) {
                        const permissions = options.permissions || this.permissions;

                        if (options.embeds && !permissions.has('embedLinks')) {
                                if (permissions.has('sendMessages')) {
                                        this.send("I'm missing permissions to `Embed Links` and can't display this message.");
                                }

                                return Promise.resolve();
                        }
                }

                return this.eris.createMessage(this.channel.id, options, ...args);
        }

        codeblock(content, lang = '') {
                return this.send('```' + lang + '\n' + content + '\n```');
        }
}

Context.prototype.info = createResponseFunction('info');
Context.prototype.error = createResponseFunction('error');
Context.prototype.success = createResponseFunction('success');
Context.prototype.loading = createResponseFunction('loading');
Context.prototype.premium = createResponseFunction('premium');

Context.prototype.infoEmoji = createEmojiResponseFunction('info');
Context.prototype.errorEmoji = createEmojiResponseFunction('error');
Context.prototype.successEmoji = createEmojiResponseFunction('success');
Context.prototype.loadingEmoji = createEmojiResponseFunction('loading');
Context.prototype.premiumEmoji = createEmojiResponseFunction('premium');

Context.prototype.addInfoReaction = createAddReactionFunction('info');
Context.prototype.addErrorReaction = createAddReactionFunction('error');
Context.prototype.addSuccessReaction = createAddReactionFunction('success');
Context.prototype.addLoadingReaction = createAddReactionFunction('loading');
Context.prototype.addPremiumReaction = createAddReactionFunction('premium');

Context.prototype.removeInfoReaction = createRemoveReactionFunction('info');
Context.prototype.removeErrorReaction = createRemoveReactionFunction('error');
Context.prototype.removeSuccessReaction = createRemoveReactionFunction('success');
Context.prototype.removeLoadingReaction = createRemoveReactionFunction('loading');
Context.prototype.removePremiumReaction = createRemoveReactionFunction('premium');

function createResponseFunction(name) {
        return function (content, options) {
                const colour = this.config.colours[name];
                const emoji = this.config.emojis[name];

                if (this.done && !options?.force) {
                        this.log('Skipping response as context has already been responded to.');

                        return Promise.resolve();
                }

                this.done = true;

                if (!content) return Promise.resolve();

                options = options || {};

                if (this.guild) {
                        const perms = options.permissions = this.permissions;

                        if (!perms.has('sendMessages')) return Promise.resolve();

                        if (perms.has('useExternalEmojis') && !this.config.disableEmojis) {
                                content = `<${emoji}> ` + content;
                        }

                        if (perms.has('embedLinks')) {
                                options.embed = {
                                        description: content,
                                        color: colour,
                                }
                        } else {
                                options.content = content;
                        }
                } else {
                        options.embed = {
                                description: content,
                                color: colour,
                        }
                }

                return this.send(options);
        }
}

function createEmojiResponseFunction(name) {
        return function () {
                return this.send('<' + this.config.emojis[name] + '>');
        }
}

function createAddReactionFunction(name) {
        return function () {
                const perms = this.permissions;

                if (perms && !perms.has('useExternalEmojis')) {
                        return Promise.resolve();
                }

                return this.eris.addMessageReaction(
                        this.channel.id, this.message.id, this.config.emojis[name]
                );
        }
}

function createRemoveReactionFunction(name) {
        return function () {
                const perms = this.permissions;

                if (perms && !perms.has('useExternalEmojis')) {
                        return Promise.resolve();
                }
                
                return this.eris.removeMessageReaction(
                        this.channel.id, this.message.id, this.config.emojis[name]
                );
        }
}

module.exports = Context;