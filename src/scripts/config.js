// GOOD LUCK with reading this code lol
const bot = new (require('../core/Bot'));
const mongoose = bot.mongoose = new (require('../core/clients/Mongoose'))(bot);
const { logger } = bot;
const state = process.argv[3] || bot.baseConfig.client.state
const opt = process.argv[2];
logger.info(`State: "${state}".`);
if (['c', 'create'].includes(opt)) createConfig();
else if (['d', 'delete'].includes(opt)) mongoose.models.Config.deleteOne({ state })
    .then(({deletedCount}) => {
        if (deletedCount) return logger.info('Deleted config.');
        logger.error('Config not found.');
    })
    .catch(err => logError(err))
    .finally(() => process.exit());
else if (['r', 'register'].includes(opt)) registerConfig()
    .catch(err => logError(err))
    .finally(() => process.exit());
else mongoose.models.Config
    .findOne({ state })
    .then(c => {
        if (c) return logger.info('Config exists.');
        logger.info('Config not found.');
        return createConfig();
    })
    .catch(err => logError(err))
    .finally(() => process.exit());
function createConfig() {
    return mongoose.models.Config.create({ state })
        .then(() => logger.info('Created config.'))
        .catch(err => {
            if (err?.code === 11000) return logger.error('Cannot create config (DuplicateKeyError).');
            logError(err)
        })
        .finally(() => registerConfig()
            .catch(err => logError(err))
            .finally(() => process.exit())
        );
}
async function registerConfig() {
    bot.commands = new (require('../core/collections/CommandCollection'))(bot);
    bot.modules = new (require('../core/collections/ModuleCollection'))(bot);
    bot.modules.load();
    await mongoose.models.Config.findOne({ state }).then(config => bot.config = config);
    if (!bot.config) return logger.error('Config not found.');
    await Promise.all([bot.modules.register(), bot.commands.register()]);
    logger.info('Registered commands & modules to config.');
}
function logError(err) {
    logger.error('Something went wrong.');
    console.error(err);
}
