import * as utils from '../utils/helpers';
import type * as eris from 'eris';
import type * as types from '@engel/types';
import Core from './Core';

const permissionsMapping: Record<keyof eris.Constants['Permissions'], string> = {
        createInstantInvite: 'Create Instant Invite',
        kickMembers: 'Kick Members',
        banMembers: 'Ban Members',
        administrator: 'Administrator',
        manageChannels: 'Manage Channels',
        manageGuild: 'Manage Server',
        addReactions: 'Add Reactions',
        viewAuditLogs: 'View Audit Logs',
        voicePrioritySpeaker: 'Priority Speaker',
        voiceStream: 'Stream',
        viewChannel: 'View Channel',
        sendMessages: 'Send Messages',
        sendTTSMessages: 'Send TTS Messages',
        manageMessages: 'Manage Messages',
        embedLinks: 'Embed Links',
        attachFiles: 'Attach Files',
        readMessageHistory: 'Read Message History',
        mentionEveryone: 'Mention Everyone',
        useExternalEmojis: 'Use External Emojis',
        viewGuildInsights: 'View Server Insights',
        voiceConnect: 'Connect',
        voiceSpeak: 'Speak',
        voiceMuteMembers: 'Mute Members',
        voiceDeafenMembers: 'Deafen Members',
        voiceMoveMembers: 'Move Members',
        voiceUseVAD: 'Use Voice Activity',
        changeNickname: 'Change Nickname',
        manageNicknames: 'Manage Nicknames',
        manageRoles: 'Manage Roles',
        manageWebhooks: 'Manage Webhooks',
        viewAuditLog: 'View Audit Logs',
        stream: 'Stream',
        manageEmojis: 'Manage Emojis',
        useSlashCommands: 'Use Slash Commands',
        voiceRequestToSpeak: 'Request To Speak',
        readMessages: 'View Channel',
        externalEmojis: 'Use External Emojis',
        manageEmojisAndStickers: 'Manage Emojis And Stickers',
        useApplicationCommands: 'Use Application Commands',
        manageEvents: 'Manage Events',
        manageThreads: 'Manage Threads',
        createPublicThreads: 'Create Public Threads',
        createPrivateThreads: 'Create Private Threads',
        useExternalStickers: 'Use External Stickers',
        sendMessagesInThreads: 'Send Messages In Threads',
        startEmbeddedActivities: 'Start Embedding Activities',
        allGuild: 'All Guild',
        allText: 'All Text',
        allVoice: 'All Voice',
        all: 'All'
};

export default class Base {
        public core: Core;

        public constructor(core?: Core) {
                if (!(this.core = core || Core.instance)) {
                        throw new Error('Missing core instance.');
                }
        }

        public get permissionsMapping() {
                return permissionsMapping;
        }

        public get logPrefix(): string {
                return this.constructor.name;
        }

        public get eris() {
                return this.core.eris;
        }

        public get state() {
                return this.baseConfig.client.state;
        }

        public get baseConfig() {
                return this.core.baseConfig;
        }

        public get config() {
                return this.core.config;
        }

        public get logger() {
                return this.core.logger;
        }

        public get mongoose() {
                return this.core.mongoose;
        }

        public get models() {
                return this.core.models;
        }

        public get redis() {
                return this.core.redis;
        }

        public get utils() {
                return utils;
        }

        public log(message?: any, level?: types.LogLevels, prefix?: string): void {
                prefix = prefix || this.logPrefix || this.constructor.name;

                this.core.log(message, level, prefix);
        }
}
