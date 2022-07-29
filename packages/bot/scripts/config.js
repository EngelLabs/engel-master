require('@engel/env-util').config({ ignoreMissing: true });

const { App, createLogger, MongoDB } = require('@engel/core');

const app = new App();

app.logger = createLogger(app);

app.mongo = new MongoDB(app);

const state = process.argv[3] ?? app.staticConfig.client.state;
app.staticConfig.client.state = state;

const option = process.argv[2];

app.logger.info(`State: "${state}".`);

createIndexes().then(() => {
        switch (option) {
                case 'c':
                case 'create':
                        createConfig();

                        break;
                case 'd':
                case 'delete':
                        deleteConfig();

                        break;
                case 'r':
                case 'register':
                        registerConfig();

                        break;
                default:
                        app.mongo.configurations
                                .findOne({ state })
                                .then(config => {
                                        if (!config) {
                                                app.logger.info('Config not found.');

                                                return createConfig();
                                        }

                                        app.logger.info('Config exists.');
                                })
                                .catch(err => {
                                        app.logger.error(err);
                                })
                                .finally(() => {
                                        process.exit();
                                });
        }
});

function createIndexes() {
        const promises = [];

        promises.push(app.mongo.commandlogs.createIndexes([
                { key: { name: 1 } },
                { key: { failed: 1 } },
                { key: { 'message.id': 1 } },
                { key: { 'message.guild': 1 } }
        ]));
        promises.push(app.mongo.configurations.createIndexes([
                { key: { state: 1 }, unique: true }
        ]));
        promises.push(app.mongo.guilds.createIndexes([
                { key: { id: 1 }, unique: true }
        ]));
        promises.push(app.mongo.modlogs.createIndexes([
                { key: { guild: 1 } },
                { key: { guild: 1, case: 1 }, unique: true },
                { key: { guild: 1, case: 1, expiry: 1 } },
                { key: { guild: 1, 'user.id': 1 } },
                { key: { guild: 1, 'channel.id': 1 } },
                { key: { guild: 1, 'mod.id': 1 } },
                { key: { expiry: 1 } }
        ]));
        promises.push(app.mongo.tags.createIndexes([
                { key: { guild: 1 } },
                { key: { guild: 1, name: 1 }, unique: true },
                { key: { guild: 1, author: 1 } }
        ]));
        return Promise.all(promises)
                .then(() => app.logger.info('Created indexes'))
                .catch(err => app.logger.error(err));
}

function createConfig() {
        return app.mongo.configurations.insertOne(defaultConfig)
                .then(() => {
                        app.logger.info('Created config.');
                })
                .catch(err => {
                        if (err?.code === 11000) {
                                return app.logger.error('Cannot create config (DuplicateKeyError).');
                        }

                        app.logger.error(err);
                })
                .finally(() => {
                        return registerConfig();
                });
}

function deleteConfig() {
        return app.mongo.configurations.deleteOne({ state })
                .then(({ deletedCount }) => {
                        if (deletedCount) {
                                return app.logger.info('Deleted config.');
                        }

                        app.logger.error('Config not found.');
                })
                .catch(err => {
                        app.logger.error(err);
                })
                .finally(() => {
                        process.exit();
                });
}

async function registerConfig() {
        try {
                const CommandCollection = require('../build/src/core/collections/CommandCollection').default;
                const ModuleCollection = require('../build/src/core/collections/ModuleCollection').default;

                app.commands = new CommandCollection(app);
                app.modules = new ModuleCollection(app);

                const config = await app.getConfig();

                if (!config) {
                        throw new Error('Config not found.');
                }

                app.config = config;

                await app.modules.load();

                await Promise.all([app.modules.register(), app.commands.register()]);

                app.logger.info('Registered commands & modules to config.');
        } catch (err) {
                app.logger.error(err);
        }

        process.exit();
}

const defaultConfig = {
        state,
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
