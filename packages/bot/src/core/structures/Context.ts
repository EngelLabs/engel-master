import * as utils from '@engel/utils';
import * as eris from 'eris';
import type * as types from '@engel/types';
import Base from './Base';
import type Command from './Command';
import type Module from './Module';
import type Core from '../Core';

interface ContextOptions<M extends Module, C extends Command> {
        args: string[];
        prefix: string;
        message: eris.Message;
        command: C;
        module: M;
        isDM: boolean;
        isAdmin: boolean;
        guildConfig: types.GuildConfig;
}

interface ContextResponseOptions extends Omit<eris.AdvancedMessageContent, 'content'> {
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

interface Embed extends eris.EmbedOptions {
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
export default class Context<M extends Module = Module, C extends Command = Command> extends Base {
        public locals?: any;
        public done?: boolean;
        public err?: any;
        public args: string[];
        public prefix: string;
        public message: eris.Message;
        public command: C;
        public module: M;
        public isDM: boolean;
        public isAdmin: boolean;
        public guildConfig: types.GuildConfig;
        public info = createResponseFunction('info');
        public error = createResponseFunction('error');
        public success = createResponseFunction('success');
        public loading = createResponseFunction('loading');
        public premium = createResponseFunction('premium');
        public infoEmoji = createEmojiResponseFunction('info');
        public errorEmoji = createEmojiResponseFunction('error');
        public successEmoji = createEmojiResponseFunction('success');
        public loadingEmoji = createEmojiResponseFunction('loading');
        public premiumEmoji = createEmojiResponseFunction('premium');
        public addInfoReaction = createAddReactionFunction('info');
        public addErrorReaction = createAddReactionFunction('error');
        public addSuccessReaction = createAddReactionFunction('success');
        public addLoadingReaction = createAddReactionFunction('loading');
        public addPremiumReaction = createAddReactionFunction('premium');
        public removeInfoReaction = createRemoveReactionFunction('info');
        public removeErrorReaction = createRemoveReactionFunction('error');
        public removeSuccessReaction = createRemoveReactionFunction('success');
        public removeLoadingReaction = createRemoveReactionFunction('loading');
        public removePremiumReaction = createRemoveReactionFunction('premium');

        public constructor(core: Core, options: ContextOptions<M, C>) {
                super(core);

                this.args = options.args;
                this.prefix = options.prefix;
                this.message = options.message;
                this.command = options.command;
                this.module = options.module;
                this.isDM = options.isDM;
                this.isAdmin = options.isAdmin;
                this.guildConfig = options.guildConfig;
        }

        public get guild(): eris.Guild | undefined {
                if (!(this.message.channel instanceof eris.PrivateChannel)) {
                        return this.message.channel.guild;
                }
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
                if (!(this.message.channel instanceof eris.PrivateChannel)) {
                        return this.message.channel.permissionsOf?.(this.eris.user.id);
                }
        }

        public get topRole(): eris.Role | undefined {
                return utils.getTopRole(this.eris, this.guild);
        }

        public get moduleConfig(): types.ModuleConfig | undefined {
                return this.guildConfig.modules[this.module.dbName];
        }

        public set moduleConfig(config: types.ModuleConfig) {
                this.guildConfig.modules = this.guildConfig.modules || {};
                this.guildConfig.modules[this.module.dbName] = config;
        }

        public get commandConfig(): types.CommandConfig | boolean | undefined {
                return this.guildConfig.commands?.[this.command.rootName];
        }

        public set commandConfig(config: types.CommandConfig | boolean) {
                this.guildConfig.commands = this.guildConfig.commands || {};
                this.guildConfig.commands[this.command.rootName] = config;
        }

        public log(message?: string, level?: types.LogLevels, prefix?: string): void {
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
                                        color: colour
                                };
                        } else {
                                toSend.content = content;
                        }
                } else {
                        toSend.embed = {
                                description: content,
                                color: colour
                        };
                }

                return this.send(toSend);
        };
}

function createEmojiResponseFunction(name: string): EmojiResponseFunction {
        return function () {
                return this.send('<' + this.config.emojis[name] + '>');
        };
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
        };
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
        };
}
