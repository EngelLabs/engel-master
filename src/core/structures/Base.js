const Server = require('../Server');


const permissionsMapping = {
        createInstantInvite: 'Create Instant Invite',
        kickMembers: 'Kick Members',
        banMembers: 'Ban Members',
        administrator: 'Administrator',
        manageChannels: 'Manage Channels',
        manageGuild: 'Manage Server',
        addReactions: 'Add Reactions',
        viewAuditLog: 'View Audit Logs',
        voicePrioritySpeaker: 'Voice Priority Speaker',
        voiceStream: 'Voice Stream',
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
        voiceConnect: 'Voice Connect',
        voiceSpeak: 'Voice Speak',
        voiceMuteMembers: 'Voice Mute Members',
        voiceDeafenMembers: 'Voice Deafen Members',
        voiceMoveMembers: 'Voice Move Members',
        voiceUseVAD: 'Voice Use Activity',
        changeNickname: 'Change Nickname',
        manageNicknames: 'Manage Nicknames',
        manageRoles: 'Manage Roles',
        manageWebhooks: 'Manage Webhooks',
        manageEmojis: 'Manage Emojis',
        useSlashCommands: 'Use Slash Commands',
        voiceRequestToSpeak: 'Voice Request To Speak',
};


/**
 * Base class with various getters and helper methods
 * @class Base
 */
class Base {
        /**
         * Initialize the class instance
         * @param {Server} server The server instance
         */
        constructor(server) {
                if (new.target === Base) {
                        throw new Error('Cannot construct instances of Base directly');
                }

                this.server = server || Server.instance;
        }

        get app() {
                return this.server.app;
        }

        /**
         * The Eris client instance
         */
        get eris() {
                return this.server.eris;
        }

        /**
         * The app state
         */
        get state() {
                return this.server.state;
        }

        /**
         * The configuration object
         * @type {Object}
         */
        get config() {
                return this.server.config;
        }

        /**
         * The static configuration object
         * @type {Object}
         */
        get baseConfig() {
                return this.server.baseConfig;
        }

        /**
         * The logger instance
         */
        get logger() {
                return this.server.logger;
        }

        /**
         * The MongoDB database instance
         */
        get database() {
                return this.server.database;
        }

        /**
         * The redis client instance
         */
        get redis() {
                return this.server.redis;
        }

        get permissionsMapping() {
                return permissionsMapping;
        }

        /**
         * Log a message
         * @param {String} msg The message to log
         * @param {String} level The logging severity
         * @param {String} prefix Log prefix (for context)
         * @returns {any}
         */
        log(msg, level = 'info', prefix) {
                if (!msg) return;

                prefix = prefix || this.constructor.name;

                if (level === 'error') {
                        this.logger.error(`[${prefix}] Something went wrong.`);
                        return console.error(msg);
                }

                return this.logger[level](`[${prefix}] ${msg}`);
        }
}


module.exports = Base;