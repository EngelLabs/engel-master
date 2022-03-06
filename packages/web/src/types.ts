/* eslint-disable camelcase */

import type * as eris from 'eris';
import type * as types from '@engel/types';

declare module 'express' {
        /* eslint-disable-next-line no-unused-vars */
        interface Request {
                body: { [key: string]: unknown };
        }
}

declare module 'express-session' {
        /* eslint-disable-next-line no-unused-vars */
        interface SessionData {
                lastSync: number;
                isAdmin: boolean,
                token: string;
                user: types.DiscordUser;
                guilds: types.DiscordGuild[];
                allGuilds: types.DiscordGuild[];
        }
}

declare module '@engel/types' {
        export interface DiscordUser {
                id: string;
                username: string;
                discriminator: string;
                avatar: string | null;
                mfa_enabled?: boolean;
                banner?: string | null;
                accent_color?: number | null;
                locale?: string;
                flags?: number;
                premium_type?: number;
                public_flags?: number;
        }

        export interface DiscordRole {
                id: string;
                name: string;
                color: number;
                hoist: boolean;
                icon?: string | null;
                unicode_emoji?: string | null;
                position: number;
                permissions: string;
                managed: boolean;
                mentionable: boolean;
                tags?: eris.RoleTags;
        }

        export interface DiscordEmoji {
                id: string | null;
                name: string;
                roles?: string[];
                user?: DiscordUser;
                require_colons?: boolean;
                managed?: boolean;
                animated?: boolean;
                available?: boolean;
        }

        export interface DiscordSticker {
                id: string;
                pack_id?: string;
                name: string;
                description: string | null;
                tags: string;
                type: number;
                format_type: number;
                available?: boolean;
                guild_id?: string;
                user?: DiscordUser;
                sort_value?: number;
        }

        export interface DiscordGuild {
                id: string;
                name: string;
                icon: string | null;
                icon_hash?: string | null;
                splash: string | null;
                discovery_splash: string | null;
                owner: boolean;
                owner_id: string;
                permissions: string;
                afk_channel_id: string | null;
                afk_timeout: number;
                widget_enabled?: boolean;
                widget_channel_id?: string | null;
                verification_level: number;
                default_message_notifications: number;
                explicit_content_filter: number;
                roles: DiscordRole[],
                emojis: DiscordEmoji[],
                features: eris.GuildFeatures,
                mfa_level: number;
                application_id: string | null;
                system_channel_id: string | null;
                system_channel_flags: number;
                rules_channel_id: string | null;
                max_presences?: number | null;
                max_mmebers?: number;
                vanity_url_code: string | null;
                description: string | null;
                banner: string | null;
                premium_tier: number;
                premium_subscription_count?: number;
                preferred_locale: string;
                public_updates_channel_id: string | null;
                max_video_channel_users?: number;
                approximate_member_count?: number;
                approximate_presence_count?: number;
                welcome_screen?: eris.WelcomeScreen;
                nsfw_level: number;
                stickers?: DiscordSticker[];
                premium_progress_bar_enabled: boolean;
        }
}
