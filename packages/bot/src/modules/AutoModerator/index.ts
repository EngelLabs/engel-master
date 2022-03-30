import * as eris from 'eris';
import type * as types from '@engel/types';
import Permission from '../../core/helpers/Permission';
import Module from '../../core/structures/Module';
import type _RuleHandler from './helpers/RuleHandler';
import type { ModuleConfig } from './types';

const RuleHandler: typeof _RuleHandler = require('require-reload')('./helpers/RuleHandler', require).default;

const messageRules = <const>[
        'messageRateLimit'
];

const reactionRules = <const>[
        'reactionRateLimit'
];

type MessageRule = typeof messageRules[number];
type ReactionRule = typeof reactionRules[number];
type AnyRule = MessageRule | ReactionRule;

export default class AutoModerator extends Module {
        private _ruleHandlers: _RuleHandler;
        private _permissions: Permission;

        public constructor() {
                super();

                this.dbName = 'automod';
                this.aliases = ['automod', 'automoderation'];
                this.info = 'Configurable auto server moderation';
        }

        public injectHook() {
                this._ruleHandlers = new RuleHandler(this.core);

                this._permissions = new Permission(this.core);

                this.listeners = [];

                this.listeners.push(this.messageCreate.bind(this));
                this.listeners.push(this.messageReactionAdd.bind(this));
        }

        public ejectHook() {
                this._ruleHandlers.teardown();
        }

        private messageCreate(payload: types.GuildEvents['messageCreate']) {
                if (!Object.prototype.hasOwnProperty.call(payload.message, 'author')) {
                        return;
                }

                if (!this._preEvent(payload, payload.message.member)) {
                        return;
                }

                const { guildConfig, message } = payload;

                const moduleConfig = <ModuleConfig>guildConfig.modules.automod;

                if (!moduleConfig.rules) {
                        return;
                }

                for (const rule of messageRules) {
                        if (this._handleMessageRule(guildConfig, moduleConfig, message, rule)) {
                                return;
                        }
                }
        }

        private messageReactionAdd(payload: types.GuildEvents['messageReactionAdd']) {
                if (!(payload.reactor instanceof eris.Member)) {
                        return;
                }

                if (!Object.prototype.hasOwnProperty.call(payload.message, 'author')) {
                        return;
                }

                if (!this._preEvent(payload, payload.reactor)) {
                        return;
                }

                const { guildConfig, message, emoji, reactor } = payload;

                const moduleConfig = <ModuleConfig>guildConfig.modules.automod;

                if (!moduleConfig.rules) {
                        return;
                }

                for (const rule of reactionRules) {
                        if (this._handleReactionRules(guildConfig, moduleConfig, <types.PartialMessage>message, emoji, reactor, rule)) {
                                return;
                        }
                }
        }

        private _preRuleHandle(
                moduleConfig: ModuleConfig,
                rule: AnyRule,
                channelID?: string,
                roles?: string[]
        ): boolean {
                if (!this._ruleHandlers[rule]) {
                        this.log(`Rule handler not found for rule "${rule}". Skipping...`, 'warn');

                        return false;
                }

                const ruleConfig = moduleConfig.rules[rule];

                if (!ruleConfig || !ruleConfig.enabled) {
                        return false;
                }

                let hasOverrides = false;

                if (channelID && ruleConfig.ignoredChannels?.length && ruleConfig.ignoredChannels.find(id => id === channelID)) {
                        hasOverrides = true;

                        return false;
                }

                if (roles?.length && ruleConfig.ignoredRoles?.length && ruleConfig.ignoredRoles.find(id => roles.includes(id))) {
                        hasOverrides = true;

                        return false;
                }

                if (!hasOverrides && moduleConfig.ruleSettings) {
                        const ruleSettings = moduleConfig.ruleSettings;

                        if (channelID) {
                                if (ruleSettings.allowedChannels?.length && !ruleSettings.allowedChannels.includes(channelID)) {
                                        return false;
                                }

                                if (ruleSettings.ignoredChannels?.length && ruleSettings.ignoredChannels.includes(channelID)) {
                                        return false;
                                }
                        }

                        if (roles?.length) {
                                if (ruleSettings.allowedRoles?.length && !ruleSettings.allowedRoles.find(id => roles.includes(id))) {
                                        return false;
                                }

                                if (ruleSettings.ignoredRoles?.length && ruleSettings.ignoredRoles.find(id => roles.includes(id))) {
                                        return false;
                                }
                        }
                }

                return true;
        }

        private _handleMessageRule(
                guildConfig: types.Guild,
                moduleConfig: ModuleConfig,
                message: eris.Message<eris.GuildTextableChannel>,
                rule: MessageRule
        ): boolean {
                if (!this._preRuleHandle(moduleConfig, rule)) {
                        return false;
                }

                if (this._ruleHandlers[rule](guildConfig, message)) {
                        this.log(`Message rule "${rule}" handled for C${message.channel.id} U${message.author.id}`);

                        return true;
                }

                return false;
        }

        private _handleReactionRules(
                guildConfig: types.Guild,
                moduleConfig: ModuleConfig,
                message: types.PartialMessage,
                emoji: eris.PartialEmoji,
                reactor: eris.Member,
                rule: ReactionRule
        ): boolean {
                if (!this._preRuleHandle(moduleConfig, rule)) {
                        return false;
                }

                if (this._ruleHandlers[rule](guildConfig, message, emoji, reactor)) {
                        this.log(`Reaction rule "${rule}" handled for C${message.channel.id} U${reactor.id}`);

                        return true;
                }

                return false;
        }

        private _preEvent(
                payload: types.GuildPayload & types.UserPayload,
                member: eris.Member
        ): boolean {
                if (!member) {
                        return false;
                }

                if (this.config.paused) {
                        return false;
                }

                const { isTester, isTesting, isAdmin, guildConfig } = payload;

                if (!guildConfig) {
                        return false;
                }

                if (guildConfig.isIgnored) {
                        return false;
                }

                if (guildConfig.client !== this.baseConfig.client.name) {
                        return false;
                }

                if (guildConfig.isPremium && (!this.baseConfig.client.premium || guildConfig.hasPremium)) {
                        return false;
                }

                if (!guildConfig.modules?.automod) {
                        return false;
                }

                if (!this.isEnabled(guildConfig)) {
                        return false;
                }

                const baseConfig = this.baseConfig;

                if (isAdmin || (baseConfig.dev && (!isTesting || !isTester))) {
                        return false;
                }

                if (member.id === this.eris.user.id) {
                        return false;
                }

                if (this._permissions.isServerAdmin(member.guild, member)) {
                        return false;
                }

                const moduleConfig = <ModuleConfig>guildConfig.modules.automod;

                if (moduleConfig.protectedRoles?.length && member.roles?.length && moduleConfig.protectedRoles.find(id => member.roles.includes(id))) {
                        return false;
                }

                return true;
        }
}
