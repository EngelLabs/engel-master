/* eslint-disable new-cap */
// GOOD LUCK with reading this code lol
const core = new (require('../build/src/core/Core')).default();
const logger = core.logger = (require('@engel/core').Logger)(core);
const mongoose = core.mongoose = (require('@engel/core').Mongoose)(core);
mongoose.set('autoCreate', true);
mongoose.set('autoIndex', true);
const state = process.argv[3] || core.baseConfig.client.state;
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
        core.commands = new (require('../build/src/core/collections/CommandCollection').default)(core);
        core.modules = new (require('../build/src/core/collections/ModuleCollection').default)(core);
        core.modules.load();
        await mongoose.models.Config.findOne({ state }).then(config => { core.config = config; });
        if (!core.config) return logger.error('Config not found.');
        await Promise.all([core.modules.register(), core.commands.register()]);
        logger.info('Registered commands & modules to config.');
}
function logError(err) {
        logger.error('Something went wrong.');
        console.error(err);
}
