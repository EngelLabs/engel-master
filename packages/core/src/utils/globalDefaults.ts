import type * as types from '@engel/types';

export default <types.Config>{
        state: '',
        author: {
                id: '329768023869358081',
                name: 'timtoy#1336'
        },
        prefixes: {
                private: [],
                default: [
                        '?'
                ],
                dm: [
                        't.',
                        '?',
                        '!',
                        ''
                ]
        },
        guilds: {
                official: {
                        id: '932441828073017354',
                        invite: 'https://discord.gg/TJnMgKF5m6'
                },
                protected: ['932441828073017354'],
                testing: ['928418564191424523']
        },
        users: {
                developers: [
                        '329768023869358081' // timtoy#1336
                ],
                protected: [
                        '329768023869358081', // timtoy#1336
                        '827788394401890374', // Engel#3566
                        '913588451226554438', // Engel#0680
                        '940009875558256660', // Engel#1907
                        '940010513130225675', // Engel#6826
                        '828029312984285225', // Engel#5433
                        '828377832950464572' // Engel#4156
                ],
                testers: [
                        '329768023869358081', // timtoy#1336
                        '403354067520323587' // catto#0924
                ],
                blacklisted: []
        },
        webhooks: {
                errorLog: {
                        id: '883119946811461673',
                        token: 'fACXsT2bykNhE2VaZRGopM2EENDer7ukV3O-0dteaith-5EbbejpOG2r2kCgb7ZTjvj5'
                },
                guildLog: {
                        id: '905852429478817842',
                        token: 'uLdaXdP3ZbFd4Uup8P9GKgkGyZcbZSlnOXSE2morR5I0_wJjpQeDcYehzF7uCiNgvacA'
                }
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
                staff: ''
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
        dmCommands: true
};
