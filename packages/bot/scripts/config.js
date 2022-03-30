/* eslint-disable new-cap */
// GOOD LUCK with reading this code lol
const app = new (require('../build/src/core/structures/App')).default();
const logger = app.logger = (require('@engel/core').Logger)(app);
const mongoose = app.mongoose = (require('@engel/core').Mongoose)(app);
mongoose.set('autoCreate', true);
mongoose.set('autoIndex', true);
const state = process.argv[3] || app.baseConfig.client.state;
const opt = process.argv[2];
logger.info(`State: "${state}".`);
if (['c', 'create'].includes(opt)) createConfig();
else if (['d', 'delete'].includes(opt)) {
        mongoose.models.Config.deleteOne({ state })
                .then(({ deletedCount }) => {
                        if (deletedCount) return logger.info('Deleted config.');
                        logger.error('Config not found.');
                })
                .catch(err => logError(err))
                .finally(() => process.exit());
} else if (['r', 'register'].includes(opt)) {
        registerConfig()
                .catch(err => logError(err))
                .finally(() => process.exit());
} else {
        mongoose.models.Config
                .findOne({ state })
                .then(c => {
                        if (c) return logger.info('Config exists.');
                        logger.info('Config not found.');
                        return createConfig();
                })
                .catch(err => logError(err))
                .finally(() => process.exit());
}
function createConfig() {
        return mongoose.models.Config.create({ state })
                .then(() => logger.info('Created config.'))
                .catch(err => {
                        if (err?.code === 11000) return logger.error('Cannot create config (DuplicateKeyError).');
                        logError(err);
                })
                .finally(() => registerConfig()
                        .catch(err => logError(err))
                        .finally(() => process.exit())
                );
}
async function registerConfig() {
        app.commands = new (require('../build/src/core/collections/CommandCollection').default)(app);
        app.modules = new (require('../build/src/core/collections/ModuleCollection').default)(app);
        await app.modules.load();
        await mongoose.models.Config.findOne({ state }).then(config => { app.config = config; });
        if (!app.config) return logger.error('Config not found.');
        await Promise.all([app.modules.register(), app.commands.register()]);
        logger.info('Registered commands & modules to config.');
}
function logError(err) {
        logger.error(err);
}
