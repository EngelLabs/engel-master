import * as eris from 'eris';
import type * as types from '@engel/types';
import Base from '../../../core/structures/Base';
import Moderation from '../../../core/helpers/Moderation';
import type Core from '../../../core/Core';
import type { ModuleConfig, Rule } from '../types';

interface MessageRateLimit {
        created: number;
        per: number;
        messages: string[];
}

interface ReactionRateLimit {
        created: number;
        per: number;
        messages: string[];
}

class RuleHandler extends Base {
        private _moderation: Moderation;
        private _logger: any /* TODO */
        private _messageRateLimits: Map<string, MessageRateLimit>;
        private _reactionRateLimits: Map<string, ReactionRateLimit>;
        private _clearRateLimitsTask: NodeJS.Timer;

        public constructor(core: Core) {
                super(core);

                this._moderation = new Moderation(this.core);

                this._messageRateLimits = new Map();
                this._reactionRateLimits = new Map();

                this._clearRateLimitsTask = setInterval(this._clearRatelimits.bind(this), 15000);
        }

        public teardown() {
                if (this._clearRateLimitsTask) {
                        clearInterval(this._clearRateLimitsTask);
                }
        }

        public messageRateLimit(guildConfig: types.Guild, message: eris.Message<eris.GuildTextableChannel>) {
                const key = `${message.channel.id}${message.author.id}`;

                const ruleConfig = (<ModuleConfig>guildConfig.modules.automod).rules.messageRateLimit;

                const rateLimit = this._messageRateLimits.get(key);

                if (!rateLimit) {
                        this._messageRateLimits.set(key, { created: Date.now(), per: ruleConfig.per || 5000, messages: [message.id] });

                        return false;
                }

                rateLimit.messages.push(message.id);

                if ((Date.now() - rateLimit.created) <= rateLimit.per) {
                        if (rateLimit.messages.length >= (ruleConfig.max || 5)) {
                                this._messageRateLimits.delete(key);

                                if (ruleConfig.purgeMessages) {
                                        this.eris.deleteMessages(message.channel.id, rateLimit.messages)
                                                .catch(() => null);
                                }

                                this._postRuleHandle(
                                        guildConfig,
                                        ruleConfig,
                                        message.author,
                                        message.channel,
                                        'Automated action due to user sending messages too quickly',
                                        `${message.author.mention}, You're sending messages too fast!`,
                                        "You're sending messages too fast!",
                                        'message-rate-limit'
                                );

                                return true;
                        }
                } else {
                        this._messageRateLimits.delete(key);

                        return false;
                }

                return false;
        }

        public reactionRateLimit(
                guildConfig: types.Guild,
                message: types.PartialMessage,
                emoji: eris.PartialEmoji,
                reactor: eris.Member
        ): boolean {
                const ruleConfig = (<ModuleConfig>guildConfig.modules.automod).rules.reactionRateLimit;

                if (ruleConfig.ignoredMessages?.length && ruleConfig.ignoredMessages.find(id => message.id === id)) {
                        return false;
                }

                const key = `${message.channel.id}${reactor.id}${emoji.id}${emoji.name}`;

                const rateLimit = this._reactionRateLimits.get(key);

                if (!rateLimit) {
                        this._reactionRateLimits.set(key, {
                                created: Date.now(),
                                per: (ruleConfig.per || 10000),
                                messages: [message.id]
                        });

                        return false;
                }

                if (rateLimit.messages.includes(message.id)) {
                        return false;
                }

                rateLimit.messages.push(message.id);

                if ((Date.now() - rateLimit.created) <= rateLimit.per) {
                        if (rateLimit.messages.length >= (ruleConfig.max || 5)) {
                                this._reactionRateLimits.delete(key);

                                if (ruleConfig.removeReactions) {
                                        const reaction = !emoji.id ? emoji.name : `${emoji.name}:${emoji.id}`;

                                        for (const id of rateLimit.messages) {
                                                this.eris.removeMessageReaction(message.channel.id, id, reaction, reactor.id)
                                                        .catch(() => null);
                                        }
                                }

                                this._postRuleHandle(
                                        guildConfig,
                                        ruleConfig,
                                        reactor.user,
                                        message.channel,
                                        'Automated action due to user adding message reactions too quickly',
                                        `${reactor.mention}, You're adding reactions too fast!`,
                                        "You're adding reactions too fast!",
                                        'reaction-rate-limit'
                                );

                                return true;
                        }
                } else {
                        this._reactionRateLimits.delete(key);

                        return false;
                }
        }

        private _clearRatelimits() {
                if (this._messageRateLimits.size) {
                        for (const [key, rateLimit] of this._messageRateLimits.entries()) {
                                const now = Date.now();

                                if ((now - rateLimit.created) >= rateLimit.per) {
                                        this._messageRateLimits.delete(key);
                                }
                        }
                }

                if (this._reactionRateLimits.size) {
                        for (const [key, rateLimit] of this._reactionRateLimits.entries()) {
                                const now = Date.now();

                                if ((now - rateLimit.created) >= rateLimit.per) {
                                        this._reactionRateLimits.delete(key);
                                }
                        }
                }
        }

        private _postRuleHandle(
                guildConfig: types.Guild,
                ruleConfig: Rule,
                user: eris.Member | eris.User,
                channel: eris.GuildTextableChannel,
                reason: string,
                guildWarning: string,
                dmWarning: string,
                friendlyRuleName: string
        ) {
                if (ruleConfig.log) {
                        this._moderation.createModlog(
                                guildConfig,
                                `automod[${friendlyRuleName}]`,
                                null,
                                null,
                                reason,
                                this.eris.user,
                                user,
                                channel
                        );
                }

                if (ruleConfig.warnUser) {
                        const _sendWarning = (toSend: eris.TextableChannel) => {
                                const msg = toSend instanceof eris.PrivateChannel
                                        ? `Server: **${channel.guild.name}**\n${dmWarning}`
                                        : guildWarning;

                                this.utils.sendMessage(toSend, msg)
                                        .then(async msg => {
                                                if (!msg) return;

                                                await this.utils.sleep(6000);

                                                return msg.delete();
                                        })
                                        .catch(() => null);
                        };

                        if (ruleConfig.warnUserInDM) {
                                this.eris.getDMChannel(user.id)
                                        .then(channel => {
                                                _sendWarning(channel);
                                        });
                        } else {
                                _sendWarning(channel);
                        }
                }
        }
}

export default RuleHandler;
