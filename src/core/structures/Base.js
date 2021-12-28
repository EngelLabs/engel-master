let Bot;

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
     * @param {Bot} bot The bot instance
     */
    constructor(bot) {
        if (new.target === Base) {
            throw new Error('Cannot construct instances of Base directly');
        }

        // importing it here cause of some weird cyclic stuff idk
        if (!Bot) Bot = require('../Bot');

        this._bot = bot || Bot.instance;
    }

    get bot() {
        return this._bot;
    }

    /**
     * The Eris client instance
     */
    get eris() {
        return this._bot.eris;
    }

    /**
     * The app state
     */
    get state() {
        return this._bot.state;
    }

    /**
     * The configuration object
     * @type {Object}
     */
    get config() {
        return this._bot.config;
    }

    /**
     * The static configuration object
     * @type {Object}
     */
    get baseConfig() {
        return this._bot.baseConfig;
    }

    /**
     * The logger instance
     */
    get logger() {
        return this._bot.logger;
    }

    /**
     * The Mongoose instance
     */
    get mongoose() {
        return this._bot.mongoose;
    }

    /**
     * The models registered to the Mongoose instance
     */
    get models() {
        return this._bot.models;
    }

    /**
     * The redis client instance
     */
    get redis() {
        return this._bot.redis;
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

    waitFor(eventName, fn, timeout) {
        return new Promise((resolve, reject) => {
            if (!fn) {
                fn = () => true;
            }

            const wrapped = (...args) => {
                if (fn(...args)) {
                    this.eris.removeListener(eventName, wrapped);
                    clearTimeout(timeoutTask);

                    resolve(...args);
                }
            }

            let timeoutTask;

            if (timeout) {
                timeoutTask = setTimeout(() => {
                    this.eris.removeListener(eventName, wrapped);

                    reject();
                }, timeout);
            }

            this.eris.on(eventName, wrapped);
        });
    }
}


module.exports = Base;