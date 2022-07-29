import type * as eris from 'eris';
import type * as jayson from 'jayson';
import type * as types from '@engel/types';

declare module '@engel/types' {
        interface UnknownObject {
                [key: string | number | symbol]: any;
        }

        interface PartialMessage {
                id: string;
                content: string;
                author: eris.User;
                channel: eris.GuildTextableChannel;
                createdAt: number;
                guildID: string;
        }

        type GuildMessage = eris.Message<eris.GuildTextableChannel>;

        type PrivateMessage = eris.Message<eris.PrivateChannel>;

        type GuildInteraction<T extends eris.GuildTextable = eris.GuildTextable> = (
                eris.CommandInteraction<T> |
                eris.ComponentInteraction<T> |
                eris.AutocompleteInteraction<T> |
                eris.PingInteraction
        );

        type PrivateInteraction = (
                eris.CommandInteraction<eris.PrivateChannel> |
                eris.ComponentInteraction<eris.PrivateChannel> |
                eris.AutocompleteInteraction<eris.PrivateChannel> |
                eris.PingInteraction
        );

        interface GuildPayload {
                guildConfig: types.Guild;
                isTesting: boolean;
        }

        interface UserPayload {
                isAdmin: boolean;
                isTester: boolean;
        }

        interface _GuildEvents {
                channelCreate: { channel: eris.GuildChannel };
                channelDelete: { channel: eris.GuildChannel };
                channelPinUpdate: { channel: eris.GuildTextableChannel; timestamp: number; oldTimestamp: number };
                channelUpdate: { channel: eris.GuildChannel; oldChannel: eris.OldGuildChannel | eris.OldGuildTextChannel | eris.OldGuildVoiceChannel };
                guildAvailable: { guild: eris.Guild };
                guildBanAdd: { guild: eris.Guild; user: eris.User } & UserPayload;
                guildBanRemove: { guild: eris.Guild; user: eris.User } & UserPayload;
                guildCreate: { guild: eris.Guild };
                guildDelete: { guild: eris.PossiblyUncachedGuild };
                guildEmojisUpdate: { guild: eris.PossiblyUncachedGuild; emojis: eris.Emoji[]; oldEmojis: eris.Emoji[] };
                guildMemberAdd: { guild: eris.Guild; member: eris.Member } & UserPayload;
                guildMemberChunk: { guild: eris.Guild; member: eris.Member[] } & UserPayload;
                guildMemberRemove: { guild: eris.Guild; member: eris.Member | eris.MemberPartial } & UserPayload;
                guildMemberUpdate: { guild: eris.Guild; member: eris.Member; oldMember: eris.OldMember } & UserPayload;
                guildRoleCreate: { guild: eris.Guild; role: eris.Role };
                guildRoleDelete: { guild: eris.Guild; role: eris.Role };
                guildRoleUpdate: { guild: eris.Guild; role: eris.Role; oldRole: eris.OldRole };
                guildStickersUpdate: { guild: eris.PossiblyUncachedGuild; stickers: eris.Sticker[]; oldStickers: eris.Sticker[] | null };
                guildUnavailable: { guild: eris.UnavailableGuild } & UserPayload;
                guildUpdate: { guild: eris.Guild; oldGuild: eris.OldGuild };
                interactionCreate: { interaction: GuildInteraction } & Partial<UserPayload>;
                inviteCreate: { guild: eris.Guild; invite: eris.Invite };
                inviteDelete: { guild: eris.Guild; invite: eris.Invite };
                messageCreate: { message: GuildMessage } & UserPayload;
                messageDelete: { message: PartialMessage } & UserPayload;
                messageDeleteBulk: { messages: PartialMessage[] };
                messageReactionAdd: { message: eris.PossiblyUncachedMessage | PartialMessage; emoji: eris.PartialEmoji; reactor: eris.Member | eris.Uncached } & UserPayload;
                messageReactionRemove: { message: eris.PossiblyUncachedMessage | PartialMessage; emoji: eris.PartialEmoji; userID: string } & UserPayload;
                messageReactionRemoveAll: { message: eris.PossiblyUncachedMessage | PartialMessage };
                messageReactionRemoveEmoji: { message: eris.PossiblyUncachedMessage | PartialMessage; emoji: eris.PartialEmoji };
                messageUpdate: { message: GuildMessage; oldMessage: GuildMessage | PartialMessage } & UserPayload;
                presenceUpdate: { other: eris.Member; oldPresences: eris.Presence | null } & UserPayload;
                stageInstanceCreate: { stageInstance: eris.StageInstance };
                stageInstanceDelete: { stageInstance: eris.StageInstance };
                stageInstanceUpdate: { stageInstance: eris.StageInstance; oldStageInstance: eris.OldStageInstance | null };
                threadCreate: { channel: eris.AnyThreadChannel } & UserPayload;
                threadDelete: { channel: eris.AnyThreadChannel } & UserPayload;
                threadListSync: { guild: eris.Guild; deletedThreads: (eris.AnyThreadChannel | eris.Uncached)[]; activeThreads: eris.AnyThreadChannel[]; joinedThreadsMember: eris.ThreadMember[] };
                threadMembersUpdate: { channel: eris.AnyThreadChannel; addedMembers: eris.ThreadMember[]; removedMembers: (eris.ThreadMember[] | eris.Uncached)[] };
                threadMemberUpdate: { channel: eris.AnyThreadChannel; member: eris.ThreadMember; oldMember: eris.OldThreadMember } & UserPayload;
                threadUpdate: { channel: eris.AnyThreadChannel; oldChannel: eris.OldThread } & UserPayload;
                typingStart: { channel: eris.GuildTextableChannel | eris.Uncached; user: eris.User | eris.Uncached; member: eris.Member } & UserPayload;
                unavailableGuildCreate: { guild: eris.UnavailableGuild };
                voiceChannelJoin: { member: eris.Member; channel: eris.AnyVoiceChannel } & UserPayload;
                voiceChannelLeave: { member: eris.Member; channel: eris.AnyVoiceChannel } & UserPayload;
                voiceChannelSwitch: { member: eris.Member; newChannel: eris.AnyVoiceChannel; oldChannel: eris.AnyVoiceChannel } & UserPayload;
                voiceStateUpdate: { member: eris.Member | eris.Uncached; oldState: eris.OldVoiceState | null } & UserPayload;
                webhooksUpdate: { data: eris.WebhookData };
        }

        type GuildEvents = { [K in keyof _GuildEvents]: _GuildEvents[K] & GuildPayload & UnknownObject };

        interface _NonGuildEvents {
                channelPinUpdate: { channel: eris.PrivateChannel; timestamp: number; oldTimestamp: number };
                connect: { id: number };
                debug: { message: string; id?: number };
                disconnect: {};
                error: { err: Error; id?: number };
                hello: { trace: string; id: number };
                interactionCreate: { interaction: PrivateInteraction; } & Partial<UserPayload>; // User payload only exists if interaction is not eris.PingInteraction
                messageCreate: { message: PrivateMessage } & UserPayload;
                messageReactionAdd: { message: eris.PossiblyUncachedMessage; emoji: eris.PartialEmoji; reactor: eris.Uncached } & UserPayload;
                messageReactionRemove: { message: eris.PossiblyUncachedMessage; emoji: eris.PartialEmoji; userID: string } & UserPayload;
                messageReactionRemoveAll: { message: eris.PossiblyUncachedMessage; };
                messageReactionRemoveEmoji: { message: eris.PossiblyUncachedMessage; emoji: eris.PartialEmoji };
                rawREST: { request: eris.RawRESTRequest };
                rawWS: { packet: eris.RawPacket };
                ready: {};
                shardPreReady: { id: number };
                typingStart: { channel: eris.PrivateChannel | eris.Uncached; user: eris.User | eris.Uncached; member: null } & UserPayload;
                unknown: { packet: eris.RawPacket; id?: number };
                userUpdate: { user: eris.User; oldUser: eris.PartialUser } & UserPayload;
                warn: { message: string; id?: number };
                shardDisconnect: { err: Error | undefined; id: number };
                shardReady: { id: number };
                shardResume: { id: number };
        }

        type NonGuildEvents = { [K in keyof _NonGuildEvents]: _NonGuildEvents[K] & UnknownObject };

        export type Events = GuildEvents | NonGuildEvents;

        export type EventNames = keyof GuildEvents | keyof NonGuildEvents;
        export interface JaysonMethod<ParameterT extends any = any, ReturnT extends any = any> {
                (params: ParameterT, cb: (err: jayson.JSONRPCError, value?: ReturnT) => void): void;
        }

        export interface ClusterManagerRPCMethods {
                restart: JaysonMethod<{
                        target: 'all' | 'client' | 'cluster',
                        id: string | string[] | number | number[]
                }>;
        }

        export interface ClientConfig {
                env: ClientEnv;
                name: string;
                firstClusterID: number;
                clusterCount: number;
                shardCount: number;
        }

        export interface ClientEnv {
                CLIENT_NAME: string;
                CLIENT_STATE: string;
                CLIENT_PREMIUM: boolean;
                CLIENT_ID: string;
                CLIENT_TOKEN: string;
                CLIENT_SECRET: string;
                CLIENT_SHARDS: number;
                CLIENT_CLUSTERS: number;
        }

        export interface ClusterConfig {
                id: number;
                client: string;
                firstShardID: number;
                lastShardID: number;
                env: ClusterEnv;
        }

        export interface ClusterEnv extends ClientEnv {
                CLUSTER_FIRST_SHARD: number;
                CLUSTER_LAST_SHARD: number;
                CLUSTER_ID: number;
        }

        export interface ClusterStats {
                id: number;
                client: string;
                ws: number;
                http: number;
                guilds: number;
                users: number;
                shards: Array<{
                        id: number;
                        status: eris.Shard['status'];
                        latency: number;
                        guilds: number;
                }>;
        }
}
