"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../utils/helpers");
const Core_1 = require("./Core");
const permissionsMapping = {
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
class Base {
    constructor(core) {
        if (!(this.core = core || Core_1.default.instance)) {
            throw new Error('Missing core instance.');
        }
    }
    get permissionsMapping() {
        return permissionsMapping;
    }
    get logPrefix() {
        return this.constructor.name;
    }
    get eris() {
        return this.core.eris;
    }
    get state() {
        return this.baseConfig.client.state;
    }
    get baseConfig() {
        return this.core.baseConfig;
    }
    get config() {
        return this.core.config;
    }
    get logger() {
        return this.core.logger;
    }
    get mongoose() {
        return this.core.mongoose;
    }
    get models() {
        return this.core.models;
    }
    get redis() {
        return this.core.redis;
    }
    get utils() {
        return utils;
    }
    log(message, level, prefix) {
        prefix = prefix || this.logPrefix || this.constructor.name;
        this.core.log(message, level, prefix);
    }
}
exports.default = Base;
//# sourceMappingURL=Base.js.map