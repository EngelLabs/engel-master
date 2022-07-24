require('@engel/env-util').config({ ignoreMissing: true });

const { App, createLogger, MongoDB } = require('@engel/core');

const app = new App();

app.logger = createLogger(app);

app.mongo = new MongoDB(app);

const state = process.argv[3] ?? app.baseConfig.client.state;
app.baseConfig.client.state = state;

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
        return app.mongo.configurations.insertOne({ state })
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
