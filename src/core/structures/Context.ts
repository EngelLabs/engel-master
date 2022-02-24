import * as eris from 'eris';
import { types, helpers } from '@engel/core';
import Command from './Command';
import Module from './Module';
import Base from './Base';
import Bot from '../Bot';


interface ContextOptions {
        args: string[];
        prefix: string;
        message: eris.Message;
        command: Command;
        module: Module;
        isDM: boolean;
        isAdmin: boolean;
        guildConfig: types.GuildConfig;
}

interface ContextResponseOptions {
        force?: boolean;
}

interface ResponseFunction {
        (content?: string, options?: ContextResponseOptions): Promise<eris.Message | undefined>;
}

interface EmojiResponseFunction {
        (): Promise<eris.Message | undefined>;
}

interface ReactionFunction {
        (): Promise<void>;
}

interface Embed extends eris.Embed {
        colour?: number;
}

interface ContextSendOptions extends eris.AdvancedMessageContent {
        embed?: Embed;
        embeds?: Embed[];
}

/**
 * Represents a command's execution context.
 * @class Context
 */
export default class Context extends Base {
        public args: string[];
        public prefix: string;
        public message: eris.Message;
        public command: Command;
        public module: Module;
        public isDM: boolean;
        public isAdmin: boolean;
        public guildConfig: types.GuildConfig;
        public info: ResponseFunction;
        public error: ResponseFunction;
        public success: ResponseFunction;
        public loading: ResponseFunction;
        public premium: ResponseFunction;
        public infoEmoji: EmojiResponseFunction;
        public errorEmoji: EmojiResponseFunction;
        public successEmoji: EmojiResponseFunction;
        public loadingEmoji: EmojiResponseFunction;
        public premiumEmoji: EmojiResponseFunction;
        public addInfoReaction: ReactionFunction;
        public addErrorReaction: ReactionFunction;
        public addSuccessReaction: ReactionFunction;
        public addLoadingReaction: ReactionFunction;
        public addPremiumReaction: ReactionFunction;
        public removeInfoReaction: ReactionFunction;
        public removeErrorReaction: ReactionFunction;
        public removeSuccessReaction: ReactionFunction;
        public removeLoadingReaction: ReactionFunction;
        public removePremiumReaction: ReactionFunction;

        public constructor(bot: Bot, options: ContextOptions) {
                super(bot);

                Object.assign(this, options);
        }

        public get guild(): eris.Guild | undefined {
                // @ts-ignore
                return this.message.channel.guild;
        }

        public get channel(): eris.TextableChannel {
                return this.message.channel;
        }

        public get author(): eris.User {
                return this.message.author;
        }

        public get member(): eris.Member | undefined {
                return this.message.member;
        }

        public get me(): eris.Member | undefined {
                return this.guild?.members?.get?.(this.eris.user.id);
        }

        public get permissions(): eris.Permission | undefined {
                // @ts-ignore
                // Multiple channel types exist and they all don't have permissionsOf(), and I'm too lazy to care.
                return this.channel.permissionsOf?.(this.eris.user.id);
        }

        public get topRole(): eris.Role | undefined {
                return helpers.getTopRole(this.eris, this.guild);
        }

        public get moduleConfig(): types.ModuleConfig | undefined {
                return this.guildConfig[this.module.dbName];
        }

        public set moduleConfig(config: types.ModuleConfig) {
                this.guildConfig[this.module.dbName] = config;
        }

        public get commandConfig(): types.CommandConfig | boolean | undefined {
                return this.guildConfig.commands?.[this.command.rootName];
        }

        public set commandConfig(config: types.CommandConfig | boolean) {
                this.guildConfig.commands = this.guildConfig.commands || {};
                this.guildConfig.commands[this.command.rootName] = config;
        }

        public log(message?: string, level?: string, prefix?: string): void {
                prefix = prefix || this.command.dbName;

                super.log(message, level, `Commands.${prefix}`);
        }

        public send(options?: ContextSendOptions | string, file?: eris.FileContent | eris.FileContent[]): Promise<eris.Message | undefined> {
                if (!options) {
                        return Promise.resolve(null);
                }

                if (typeof options !== 'string' && options.embed) {
                        if (!options.embeds) {
                                options.embeds = [];
                        }

                        if (options.embed.colour && !options.embed.color) {
                                options.embed.color = options.embed.colour;
                                delete options.embed.colour;
                        }

                        options.embeds.push(options.embed);

                        delete options.embed;
                }

                if (this.guild) {
                        const permissions = this.permissions;

                        if (typeof options !== 'string' && options.embeds && !permissions.has('embedLinks')) {
                                if (permissions.has('sendMessages')) {
                                        this.send("I'm missing permissions to `Embed Links` and can't display this message.");
                                }

                                return Promise.resolve(null);
                        }
                }

                return this.eris.createMessage(this.channel.id, options, file);
        }

        codeblock(content?: string, lang: string = '') {
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

function createResponseFunction(name: string): ResponseFunction {
        return function (content?: string, options?: ContextResponseOptions) {
                const colour = this.config.colours[name];
                const emoji = this.config.emojis[name];

                if (this.done && !options?.force) {
                        this.log('Skipping response as context has already been responded to.');

                        return Promise.resolve();
                }

                this.done = true;

                if (!content) return Promise.resolve();

                const toSend: any = options || {};

                if (this.guild) {
                        const perms = this.permissions;

                        if (!perms.has('sendMessages')) {
                                return Promise.resolve();
                        }

                        if (perms.has('useExternalEmojis') && !this.config.disableEmojis) {
                                content = `<${emoji}> ` + content;
                        }

                        if (perms.has('embedLinks')) {
                                toSend.embed = {
                                        description: content,
                                        color: colour,
                                }
                        } else {
                                toSend.content = content;
                        }
                } else {
                        toSend.embed = {
                                description: content,
                                color: colour,
                        }
                }

                return this.send(toSend);
        }
}

function createEmojiResponseFunction(name: string): EmojiResponseFunction {
        return function () {
                return this.send('<' + this.config.emojis[name] + '>');
        }
}

function createAddReactionFunction(name: string): ReactionFunction {
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

function createRemoveReactionFunction(name: string): ReactionFunction {
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
