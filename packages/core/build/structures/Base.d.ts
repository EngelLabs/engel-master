/// <reference types="ioredis" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose" />
import * as utils from '../utils/helpers';
import type * as eris from 'eris';
import type * as types from '@engel/types';
import Core from './Core';
export default class Base {
    core: Core;
    constructor(core?: Core);
    get permissionsMapping(): Record<"stream" | "all" | "createInstantInvite" | "kickMembers" | "banMembers" | "administrator" | "manageChannels" | "manageGuild" | "addReactions" | "viewAuditLog" | "viewAuditLogs" | "voicePrioritySpeaker" | "voiceStream" | "viewChannel" | "readMessages" | "sendMessages" | "sendTTSMessages" | "manageMessages" | "embedLinks" | "attachFiles" | "readMessageHistory" | "mentionEveryone" | "useExternalEmojis" | "externalEmojis" | "viewGuildInsights" | "voiceConnect" | "voiceSpeak" | "voiceMuteMembers" | "voiceDeafenMembers" | "voiceMoveMembers" | "voiceUseVAD" | "changeNickname" | "manageNicknames" | "manageRoles" | "manageWebhooks" | "manageEmojisAndStickers" | "manageEmojis" | "useApplicationCommands" | "useSlashCommands" | "voiceRequestToSpeak" | "manageEvents" | "manageThreads" | "createPublicThreads" | "createPrivateThreads" | "useExternalStickers" | "sendMessagesInThreads" | "startEmbeddedActivities" | "allGuild" | "allText" | "allVoice", string>;
    get logPrefix(): string;
    get eris(): eris.Client;
    get state(): string;
    get baseConfig(): {
        name: string;
        version: string;
        lib: string;
        env: string;
        dev: boolean;
        logger: {
            level: string;
            dir: string;
        };
        client: {
            state: string;
            premium: boolean;
            id: string;
            token: string;
            secret: string;
        };
        mongo: {
            host: string;
            port: string;
            db: string;
        };
        redis: {
            host: string;
            port: number;
        };
    };
    get config(): types.Config;
    get logger(): import("winston").Logger;
    get mongoose(): typeof import("mongoose");
    get models(): typeof import("../models");
    get redis(): import("ioredis").Redis;
    get utils(): typeof utils;
    log(message?: any, level?: types.LogLevels, prefix?: string): void;
}
