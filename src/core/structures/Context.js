const Base = require('./Base');


/**
 * Represents a command's execution context.
 * @class Context
 */
class Context extends Base {
    constructor(options) {
        super();
        
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
        return this.guild.members.get(this.eris.user.id);
    }

    get permissions() {
        return this.channel.permissionsOf(this.eris.user.id);
    }

    get topRole() {
        const me = this.me;
        if (!me.roles.length) return;

        const roles = this.guild.roles;
        return me.roles.map(id => roles.get(id)).reduce((prev, curr) => curr && curr.position > prev.position ? curr : prev);
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

    log = (msg, level = 'info', prefix) => {
        prefix = prefix || this.command.dbName;

        return super.log(msg, level, `Commands.${prefix}`);
    }

    send = (options, ...args) => {
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
                    this.send('I\'m missing permissions to `Embed Links` and can\'t display this message.');
                }

                return Promise.resolve();
            }
        }

        return this.eris.createMessage(this.channel.id, options, ...args);
    }

    /**
     * 
     * @param {String} content Content to sent
     * @param {Object} options Options to apply
     * @param {Boolean} options.force Whether to ignore ctx.done
     * @param {Number} colour Colour to apply to the embed
     * @param {String} emoji Emoji to prefix to the message
     * @returns 
     */
    _sendResponse(content, options = {}, colour, emoji) {
        if (this.done && !options.force) {
            this.log(`Skipping response as context has already been responded to.`);

            return Promise.resolve();
        }

        this.done = true;

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

    addErrorReaction = () => {
        return this.eris.addMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.error
        );
    }

    addSuccessReaction = () => {
        return this.eris.addMessageReaction(
            this.channel.id, this.message.id, this.bot.config.emojis.success
        );
    }

    addLoadingReaction = () => {
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