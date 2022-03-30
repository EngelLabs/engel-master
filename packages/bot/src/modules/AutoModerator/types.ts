import type * as types from '@engel/types';

export interface Rule {
        enabled?: boolean;
        log?: boolean;
        warnUser?: boolean;
        warnUserInDM?: boolean;
        logAction?: boolean;
        muteUser?: boolean;
        muteUserAfter?: number;
        kickUser?: boolean;
        kickUserAfter?: number;
        banUser?: boolean;
        banUserAfter?: number;
        ignoredRoles?: string[];
        ignoredChannels?: string[];
}

export interface MessageRateLimitRule extends Rule {
        per?: number;
        max?: number;
        purgeMessages?: boolean;
}

export interface ReactionRateLimitRule extends Rule {
        per?: number;
        max?: number;
        removeReactions?: boolean;
        ignoredMessages?: string[];
}

export interface ModuleConfig extends types.ModuleConfig {
        rules?: {
                messageRateLimit?: MessageRateLimitRule;
                reactionRateLimit?: ReactionRateLimitRule;
        };
        ruleSettings?: {
                allowedRoles?: string[];
                ignoredRoles?: string[];
                allowedChannels?: string[];
                ignoredChannels?: string[];
        }
        protectedRoles?: string[];
}
