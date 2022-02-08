const { parsed, error } = require('dotenv').config();
if (!parsed && error) {
        if (error.code === 'ENOENT') {
                console.error('.env file not found!');

                process.exit(1);
        }

        throw error;
}

const getenv = require('getenv');
const package = require('../../../package.json');

const NAME = getenv.string('CLIENT_NAME').toUpperCase();

/**
 * Static configuration
 */
const baseConfig = {
        name: package.name,
        version: package.version,
        lib: 'eris',
        env: getenv.string('NODE_ENV'),
        dev: getenv.string('NODE_ENV') === 'development',
        logger: {
                level: getenv.string('LOGGER_LEVEL', 'debug'),
        },
        client: {
                name: getenv.string('CLIENT_NAME'),
                state: getenv.string('CLIENT_STATE'),
                id: getenv.string('CLIENT_' + NAME + '_ID'),
                token: getenv.string('CLIENT_' + NAME + '_TOKEN'),
                secret: getenv.string('CLIENT_' + NAME + '_SECRET'),
        },
        mongo: {
                host: getenv.string('MONGO_HOST', '127.0.0.1'),
                port: getenv.string('MONGO_PORT', '27017'),
                db: getenv.string('MONGO_DATABASE', 'discordbot'),
        },
        redis: {
                host: getenv.string('REDIS_HOST', '127.0.0.1'),
                port: getenv.string('REDIS_PORT', '6379'),
        },
        globalDefaults: {
                author: {
                        id: '329768023869358081',
                        name: 'timtoy#1336',
                },
                prefixes: {
                        private: [],
                        default: [
                                '?',
                        ],
                        dm: [
                                't.',
                                '?',
                                '!',
                                '',
                        ],
                },
                guilds: {
                        official: {
                                id: '932441828073017354',
                                invite: 'https://discord.gg/TJnMgKF5m6',
                        },
                        protected: ['932441828073017354'],
                        testing: ['928418564191424523'], // to be moved to dedicated guild soon
                },
                users: {
                        developers: [
                                '329768023869358081', // timtoy#1336
                        ],
                        protected: [
                                '329768023869358081', // timtoy#1336
                                '827788394401890374', // timbot#3566
                                '913588451226554438', // timbot#0680
                                '940009875558256660', // timbot#1907
                                '940010513130225675', // timbot#6826
                                '828029312984285225', // timbot#5433
                                '828377832950464572', // timbot#4156
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
                        info: 8294381,
                        error: 15424347,
                        success: 7985343,
                        loading: 3684408,
                        premium: 16768297
                },
                emojis: {
                        info: ':info:932100050505592962',
                        error: ':error:932057397508308992',
                        success: ':success:932057397516709980',
                        loading: ':loading:932119984547713065',
                        premium: ':premium:932101813077934110n',
                        staff: ':SockBotStaff:847231667294961736'
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
                messageUncacheInterval: 60000,
                messageMaxAge: 2 * 24 * 60 * 60 * 1000,
                guildCache: true,
                guildUncacheInterval: 30000,
                guildMaxAge: 10000,
                paused: false,
                apiToken: '',
        }
};


module.exports = baseConfig;
