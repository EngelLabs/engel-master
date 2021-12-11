/**
 * Represents a command's execution context.
 * @class Context
 */
class Context {
    constructor(options) {
        Object.assign(this, options);
    }

    get database() {
        return this.bot.database;
    }

    get redis() {
        return this.bot.redis;
    }

    get logger() {
        return this.bot.logger;
    }

    get config() {
        return this.bot.config;
    }

    get baseConfig() {
        return this.bot.baseConfig;
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
        return this.guild.members.get(this.eris.user.id);
    }

    get permissions() {
        return this.channel.permissionsOf(this.eris.user.id);
    }

    get topRole() {
        // lol this getter used to be so fucking stupid
        // return this.message.channel.guild.members.get(this.eris.users.get(this.baseConfig.clientId).id).roles.map(id => this.message.channel.guild.roles.get(id)).map((prev, curr) => curr && curr.position > prev.position ? curr : prev);
        const me = this.me;
        if (me.roles.length) {
            const roles = this.guild.roles;
            return me.roles.map(id => roles.get(id)).reduce((prev, curr) => curr && curr.position > prev.position ? curr : prev);
        }
        // if this is confusing for anyone else:
        // this.me.roles is an array of role ids, and .map() is called to get full Role objects-
        // -at which point its reduced to role with the highest position. this getter can return undefined.
    }

    get moduleConfig() {
        return this.guildConfig[this.module.dbName];
    }

    set moduleConfig(config) {
        this.guildConfig[this.module.dbName] = config;
    }

    get commandConfig() {
        return this.guildConfig.commands && this.guildConfig.commands[this.command.rootName];
    }

    set commandConfig(config) {
        this.guildConfig.commands = this.guildConfig.commands || {};
        this.guildConfig.commands[this.command.rootName] = config;
    }

    send = (options, ...args) => {
        if (!options) return Promise.resolve();

        if (options.embed) {
            if (!options.embeds) options.embeds = [];

            options.embeds.push(options.embed);

            delete options.embed;
        }

        if (this.guild) {
            const permissions = options.permissions || this.permissions;

            if (options.embeds && !permissions.has('embedLinks')) {
                if (permissions.has('sendMessages')) {
                    this.send('I\'m missing permissions to `Embed Links` and can\'t display this message.');
                }

                return Promise.resolve();
            }
        }

        return this.eris.createMessage(this.channel.id, options, ...args);
    }

    _sendResponse = (content, options = {}, colour, emoji) => {
        if (!content) return Promise.resolve();

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

    error = (content, options = {}) => {
        return this._sendResponse(
            content,
            options,
            this.config.colours.error,
            this.config.emojis.error
        );
    }

    success = (content, options = {}) => {
        return this._sendResponse(
            content,
            options,
            this.config.colours.success,
            this.config.emojis.success
        );
    }

    loading = (content, options = {}) => {
        return this._sendResponse(
            content,
            options,
            this.config.colours.loading,
            this.config.emojis.loading
        );
    }

    errorEmoji = () => {
        return this.send('<' + this.bot.config.emojis.error + '>');
    }

    successEmoji = () => {
        return this.send('<' + this.bot.config.emojis.success + '>');
    }

    loadingEmoji = () => {
        return this.send('<' + this.bot.config.emojis.loading + '>');
    }

    errorReaction = () => {
        return this.eris.addMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.error
        );
    }

    successReaction = () => {
        return this.eris.addMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.success
        );
    }

    loadingReaction = () => {
        return this.eris.addMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.loading
        );
    }

    removeErrorReaction = () => {
        return this.eris.removeMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.error
        );
    }

    removeSuccessReaction = () => {
        return this.eris.removeMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.success
        );
    }

    removeLoadingReaction = () => {
        return this.eris.removeMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.loading
        );
    }
}


module.exports = Context;