import * as types from '../types';
import Core from './Core';


const permissionsMapping: Record<string, string> = {
        createInstantInvite: 'Create Instant Invite',
        kickMembers: 'Kick Members',
        banMembers: 'Ban Members',
        administrator: 'Administrator',
        manageChannels: 'Manage Channels',
        manageGuild: 'Manage Server',
        addReactions: 'Add Reactions',
        viewAuditLog: 'View Audit Logs',
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
        manageEmojis: 'Manage Emojis',
        useSlashCommands: 'Use Slash Commands',
        voiceRequestToSpeak: 'Request To Speak',
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

        public log(message?: any, level?: types.LogLevels, prefix?: string): void {
                prefix = prefix || this.logPrefix || this.constructor.name;

                this.core.log(message, level, prefix);
        }
}
