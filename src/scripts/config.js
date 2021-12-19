#! usr/bin/env node

'use strict';

const { models } = require('../models');
const baseConfig = require('../core/baseConfig');
const logger = require('../core/logger');

const arg = process.argv[2];


const createConfig = () => {
    models.Config.create({})
        .then(() => {
            logger.info(`Created configuration.`);

            registerConfig();
        })
        .catch(err => {
            logger.error('Something went wrong.');
            logger.error(err);

            process.exit(1);
        });
}

const registerConfig = async () => {
    const config = await models.Config.findOne({ state: baseConfig.state });

    if (!config) {
        logger.error(`Configuration not found.`);

        process.exit(1);
    }

    const ModuleCollection = require('../collections/ModuleCollection');
    const CommandCollection = require('../collections/CommandCollection');

    const commands = new CommandCollection({ models });
    const modules = new ModuleCollection({ models, commands });

    await modules.register(config);
    await commands.register(config);

    logger.info(`Modules and commands registered to configuration.`);

    process.exit(0);
}

const deleteConfig = () => {
    models.Config.deleteOne()
        .then(result => {
            if (result.deletedCount) {
                logger.info(`Deleted configuration.`);

                process.exit(0);
            } else {
                logger.error(`Failed to delete configuration.`);

                process.exit(1);
            }
        })
        .catch(err => {
            logger.error('Something went wrong.');
            console.error(err);

            process.exit(1);
        });
}

if (arg === 'create') {
    logger.info(`Creating configuration for state "${baseConfig.state}"...`);

    createConfig();
} else if (arg === 'delete') {
    logger.info(`Deleting configuration for state "${baseConfig.state}"...`);

    deleteConfig();
} else if (arg === 'register') {
    logger.info(`Registering configuration for state "${baseConfig.state}"...`);

    registerConfig();
} else {
    logger.info(`Automatically configuring app for state "${baseConfig.state}"...`);

    models.Config.findOne({ state: baseConfig.state })
        .then(c => {
            if (!c) {
                logger.info(`Configuration not found. Creating...`);
                createConfig();
            } else {
                logger.info(`Configuration already exists. Exiting...`);

                process.exit(0);
            }
        })
        .catch(err => {
            logger.error('Something went wrong.');
            console.error(err);

            process.exit(1);
        });
}