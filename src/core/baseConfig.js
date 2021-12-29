const { parsed, error } = require('dotenv').config();
if (!parsed && error) {
    if (error.code === 'ENOENT') {
        console.error('.env file not found!');

        process.exit(1);
    }

    throw error;
}


const getenv = require('getenv');
const package = require('../../package.json');

/**
 * Static configuration
 */
const baseConfig = {
    name: package.name,
    version: package.version,
    lib: 'eris',
    env: process.env.NODE_ENV,
    dev: process.env.NODE_ENV === 'development',
    logger: {
        level: getenv.string('LOGGER_LEVEL', 'debug'),
    },
    client: {
        id: getenv.string('CLIENT_ID'),
        token: getenv.string('CLIENT_TOKEN'),
        state: getenv.string('CLIENT_STATE'),
    },
    mongo: {
        host: getenv.string('MONGO_HOST', 'localhost'),
        port: getenv.int('MONGO_PORT', 27017),
        db: getenv.string('MONGO_DATABASE', 'discordbot'),
    },
    redis: {
        host: getenv.string('REDIS_HOST', 'localhost'),
        port: getenv.int('REDIS_PORT', 6379),
    },
    globalDefaults: {
        author: {
            id: '329768023869358081',
            name: 'timtoy#1336',
        },
        client: {
            permissions: 0,
        },
        prefixes: {
            private: [
                't.uwu.',
                'tim pls ',
                '',
            ],
            default: [
                '?',
            ],
        },
        guilds: {
            official: {
                id: '828010463476056137',
                invite: 'https://discord.gg/ZZpqkn6HdG'
            },
            protected: ['828010463476056137'],
            testing: ['828010463476056137'], // to be moved to dedicated guild soon
        },
        users: {
            developers: [
                '329768023869358081',
            ],
            protected: [
                '329768023869358081',
                '827788394401890374',
                '828377832950464572',
            ],
            testers: [
                '329768023869358081', // timtoy#1336
                '403354067520323587', // catto#0924
            ],
            blacklisted: [],
        },
        webhooks: {
            errorLog: {
                id: '883119946811461673',
                token: 'fACXsT2bykNhE2VaZRGopM2EENDer7ukV3O-0dteaith-5EbbejpOG2r2kCgb7ZTjvj5'
            },
            guildLog: {
                id: '905852429478817842',
                token: 'uLdaXdP3ZbFd4Uup8P9GKgkGyZcbZSlnOXSE2morR5I0_wJjpQeDcYehzF7uCiNgvacA'
            },
        },
        colours: {
            success: 7985343,
            error: 15424347,
            loading: 13098856,
            positiveLog: 6022784,
            neutralLog: 4240311,
            negativeLog: 14105670
        },
        emojis: {
            success: ':SockBot_Success:845029447010615337',
            error: ':SockBot_Error:845029436189179984',
            loading: ':SockBot_Loading:870386378150645880',
            staff: ':SockBotStaff:847231667294961736'
        },
        dmConfig: {
            prefixes: [
                't.',
                '?',
                '!',
                '',
            ],
        },
        commands: {},
        modules: {},
        disableEmojis: true,
        globalCooldown: 700,
        commandCooldown: 2500,
        cooldownWarn: true,
        cooldownWarnDelete: true,
        cooldownWarnDeleteAfter: 8000,
        adminOnly: false,
        configRefreshInterval: 25000,
        messageCache: true,
        guildCache: true,
        guildUncacheInterval: 60000,
        paused: false,
    }
};


module.exports = baseConfig;
