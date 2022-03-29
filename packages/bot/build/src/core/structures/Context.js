"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const Base_1 = require("./Base");
class Context extends Base_1.default {
    locals;
    done;
    err;
    args;
    prefix;
    message;
    command;
    module;
    isAdmin;
    guildConfig;
    info = createResponseFunction('info');
    error = createResponseFunction('error');
    success = createResponseFunction('success');
    loading = createResponseFunction('loading');
    premium = createResponseFunction('premium');
    infoEmoji = createEmojiResponseFunction('info');
    errorEmoji = createEmojiResponseFunction('error');
    successEmoji = createEmojiResponseFunction('success');
    loadingEmoji = createEmojiResponseFunction('loading');
    premiumEmoji = createEmojiResponseFunction('premium');
    addInfoReaction = createAddReactionFunction('info');
    addErrorReaction = createAddReactionFunction('error');
    addSuccessReaction = createAddReactionFunction('success');
    addLoadingReaction = createAddReactionFunction('loading');
    addPremiumReaction = createAddReactionFunction('premium');
    removeInfoReaction = createRemoveReactionFunction('info');
    removeErrorReaction = createRemoveReactionFunction('error');
    removeSuccessReaction = createRemoveReactionFunction('success');
    removeLoadingReaction = createRemoveReactionFunction('loading');
    removePremiumReaction = createRemoveReactionFunction('premium');
    constructor(core, options) {
        super(core);
        this.args = options.args;
        this.prefix = options.prefix;
        this.message = options.message;
        this.command = options.command;
        this.module = options.module;
        this.isAdmin = options.isAdmin;
        this.guildConfig = options.guildConfig;
    }
    get guild() {
        if (!(this.message.channel instanceof eris.PrivateChannel)) {
            return this.message.channel.guild;
        }
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
        if (!(this.message.channel instanceof eris.PrivateChannel)) {
            return this.message.channel.permissionsOf?.(this.eris.user.id);
        }
    }
    get topRole() {
        return this.utils.getTopRole(this.guild);
    }
    get moduleConfig() {
        return this.guildConfig.modules?.[this.module.dbName];
    }
    set moduleConfig(config) {
        this.guildConfig.modules = this.guildConfig.modules || {};
        this.guildConfig.modules[this.module.dbName] = config;
    }
    get commandConfig() {
        return this.guildConfig.commands?.[this.command.rootName];
    }
    set commandConfig(config) {
        this.guildConfig.commands = this.guildConfig.commands || {};
        this.guildConfig.commands[this.command.rootName] = config;
    }
    log(message, level, prefix) {
        prefix = prefix || this.command.dbName;
        super.log(message, level, `Commands.${prefix}`);
    }
    send(options) {
        return this.utils.sendMessage(this.channel, options);
    }
    codeblock(content, lang = '') {
        return this.send('```' + lang + '\n' + content + '\n```');
    }
}
exports.default = Context;
function createResponseFunction(name) {
    return function (content, options) {
        if (this.done && !options?.force) {
            this.log('Skipping response as context has already been responded to.');
            return Promise.resolve(null);
        }
        this.done = true;
        return this.utils.sendMessage(this.channel, content, name);
    };
}
function createEmojiResponseFunction(name) {
    return function () {
        return this.send('<' + this.config.emojis[name] + '>');
    };
}
function createAddReactionFunction(name) {
    return function () {
        return this.utils.addReaction(this.channel, this.message, name);
    };
}
function createRemoveReactionFunction(name) {
    return function () {
        return this.utils.removeReaction(this.channel, this.message, name);
    };
}
//# sourceMappingURL=Context.js.map