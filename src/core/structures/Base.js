const fs = require('fs');
const path = require('path');


let Bot;
let helpers;

const permissionsMapping = {
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

                // importing it here cause of some weird cyclic dependency stuff idk
                if (!Bot) Bot = require('../Bot');
                
                this.bot = bot || Bot.instance;

                if (!helpers) {
                        const helpersPath = path.resolve('src/helpers');

                        for (const name of fs.readdirSync(helpersPath)) {
                                helpers = helpers || {};

                                const Helper = require(`${helpersPath}/${name}`);

                                if (typeof Helper !== 'function') {
                                        this.log(`Skipping unknown helper "${Helper}".`, 'debug', 'Core');

                                        continue;
                                }

                                const helper = new Helper(this.bot);

                                if (helper._disabled) {
                                        this.log(`Skipping disabled helper "${Helper}".`, 'debug', 'Core');

                                        continue;
                                }

                                const helperName = helper._name || helper.constructor.name.toLowerCase();

                                this.log(`Helper "${helperName}" loaded.`, 'debug', 'Core');

                                helpers[helperName] = helper;
                        }
                }
        }

        /**
         * The Eris client instance
         */
        get eris() {
                return this.bot.eris;
        }

        /**
         * The app state
         */
        get state() {
                return this.bot.state;
        }

        /**
         * The static configuration object
         * @type {Object}
         */
        get baseConfig() {
                return this.bot.baseConfig;
        }

        /**
         * The configuration object
         */
        get config() {
                return this.bot.config;
        }

        /**
         * The Logger instance
         */
        get logger() {
                return this.bot.logger;
        }

        /**
         * The Mongoose instance
         */
        get mongoose() {
                return this.bot.mongoose;
        }

        /**
         * The models registered to the Mongoose instance
         */
        get models() {
                return this.bot.models;
        }

        /**
         * The Redis instance
         */
        get redis() {
                return this.bot.redis;
        }

        /**
         * Mapping of helpers
         */
        get helpers() {
                return helpers;
        }

        /**
         * Permissions mapping
         */
        get permissionsMapping() {
                return permissionsMapping;
        }

        /**
         * Capitalize a string
         * @param {String} str String to capitalize
         * @returns {String}
         */
        capitalize(str) {
                if (!str || !str.length) return '';

                return str[0].toUpperCase() + str.slice(1);
        }

        /**
         * Log a message
         * @param {String} msg The message to log
         * @param {String} level The logging severity
         * @param {String} prefix Log prefix (for context)
         * @returns {any}
         */
        log(msg, level = 'debug', prefix) {
                if (!msg) return;

                prefix = prefix || this.logPrefix || this.constructor.name;

                if (level === 'error') {
                        this.logger.error(`[${prefix}] Something went wrong.`);
                        return console.error(msg);
                }

                return this.logger[level](`[${prefix}] ${msg}`);
        }

        getTopRole(guild) {
                if (!guild) return;

                const me = guild.members.get(this.eris.user.id);
                if (!me || !me.roles.length) return;

                return me.roles.map(id => guild.roles.get(id)).reduce((prev, curr) => curr?.position > prev.position ? curr : prev);
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