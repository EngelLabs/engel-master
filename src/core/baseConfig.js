'use-strict';

require('dotenv').config();
const pkg = require('../../package.json');


module.exports = {
    name: pkg.name,
    version: pkg.version,
    env: process.env.NODE_ENV,
    state: process.env.STATE,
    logLevel: process.env.LOG_LEVEL || 'debug',
    clientId: process.env.CLIENT_ID,
    token: 'Bot ' + process.env.CLIENT_TOKEN,
    mongoUri: process.env.MONGO_URI,
    redisPort: process.env.REDIS_PORT,
    redisHost: process.env.REDIS_HOST,
    defaultOptions: {
        eris: {
            intents: [
                'directMessages',
                'guilds',
                'guildMembers',
                'guildMessages',
            ],
            restMode: true,
            messageLimit: 15,
            getAllUsers: true,
        }
    },
    globalDefaults: {
        dev: process.env.NODE_ENV === 'development',
        author: {
            id: '329768023869358081',
            name: 'timtoy#1336',
        },
        client: {
            shards: 1,
            clusterNames: [],
            permissions: 379968,
        },
        lib: 'eris',
        name: pkg.name,
        prefixes: {
            private: [
                'l.uwu.',
                'tim pls ',
                '', // enables prefix-less command invocation
            ],
            default: [
                '?',
            ],
        },
        dmConfig: {
            prefixes: [
                't.',
                '?',
                '!',
                '', // enables prefix-less command invocation
            ],
        },
        guilds: {
            official: {
                id: '828010463476056137',
                invite: 'https://discord.gg/ZZpqkn6HdG'
            },
            protected: [ '828010463476056137' ],
            testing: [],
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
        disableEmojis: true,
        commands: {},
        modules: {},
        globalCooldown: 700,
        commandCooldown: 2500,
        cooldownWarn: true,
        cooldownWarnDeleteAfter: 8000,
        shutup: false,
    },
};
