import * as eris from 'eris';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import Base from './Base';
import type Command from './Command';
import type Module from './Module';
import type App from '../structures/App';

interface ContextOptions<M extends Module, C extends Command> {
        args: string[];
        prefix: string;
        message: eris.Message;
        command: C;
        module: M;
        isAdmin: boolean;
        guildConfig: types.Guild;
}

interface ContextResponseOptions extends Omit<types.AdvancedMessageContent, 'content'> {
        force?: boolean;
}

interface ResponseFunction {
        (content?: string, options?: ContextResponseOptions): Promise<eris.Message | null>;
}

interface EmojiResponseFunction {
        (): Promise<eris.Message | undefined>;
}

interface ReactionFunction {
        (): Promise<void>;
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
        public isAdmin: boolean;
        public guildConfig: types.Guild;
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
        private _logger: core.Logger;

        public constructor(app: App, options: ContextOptions<M, C>) {
                super(app);

                this.args = options.args;
                this.prefix = options.prefix;
                this.message = options.message;
                this.command = options.command;
                this.module = options.module;
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
                return this.utils.getTopRole(this.guild);
        }

        public get moduleConfig(): types.ModuleConfig | undefined {
                return this.guildConfig.modules?.[this.module.dbName];
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

        public get logger() {
                if (!this._logger) {
                        this._logger = this.app.logger.get('Commands').get(this.command.dbName);
                }

                return this._logger;
        }

        public send(options?: string | types.AdvancedMessageContent) {
                return this.utils.sendMessage(this.channel, options);
        }

        public codeblock(content?: string, lang: string = '') {
                return this.send('```' + lang + '\n' + content + '\n```');
        }
}

function createResponseFunction(name: types.ResponseType): ResponseFunction {
        return function (this: Context, content?: string, options?: ContextResponseOptions) {
                if (this.done && !options?.force) {
                        this.logger.debug('Skipping response as context has already been responded to.');

                        return Promise.resolve(null);
                }

                this.done = true;

                return this.utils.sendMessage(this.channel, content, name);
        };
}

function createEmojiResponseFunction(name: types.ResponseType): EmojiResponseFunction {
        return function (this: Context) {
                return this.send('<' + this.config.emojis[name] + '>');
        };
}

function createAddReactionFunction(name: types.ResponseType): ReactionFunction {
        return function (this: Context) {
                return this.utils.addReaction(this.channel, this.message, name);
        };
}

function createRemoveReactionFunction(name: types.ResponseType): ReactionFunction {
        return function (this: Context) {
                return this.utils.removeReaction(this.channel, this.message, name);
        };
}
