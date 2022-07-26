import * as utils from '../utils/helpers';
import type * as eris from 'eris';
import type App from './App';

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
        public app: App;

        public constructor(app: App) {
                this.app = app;
        }

        public get permissionsMapping() {
                return permissionsMapping;
        }

        public get eris() {
                return this.app.eris;
        }

        public get state() {
                return this.baseConfig.client.state;
        }

        public get baseConfig() {
                return this.app.baseConfig;
        }

        public get config() {
                return this.app.config;
        }

        public get mongo() {
                return this.app.mongo;
        }

        public get redis() {
                return this.app.redis;
        }

        public get utils() {
                return utils;
        }
}
