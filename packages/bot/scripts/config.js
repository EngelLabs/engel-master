require('@engel/env-util').config({ ignoreMissing: true });

const { App, Logger, Mongoose } = require('@engel/core');

const app = new App();

app.logger = Logger(app);

app.mongoose = Mongoose(app);
app.mongoose.set('autoCreate', true);
app.mongoose.set('autoIndex', true);

const state = process.argv[3] ?? app.baseConfig.client.state;
app.baseConfig.client.state = state;

const option = process.argv[2];

app.logger.info(`State: "${state}".`);

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
                app.models.Config
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

function createConfig() {
        return app.models.Config.create({ state })
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
        return app.models.Config.deleteOne({ state })
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
