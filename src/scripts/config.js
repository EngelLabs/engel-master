#! usr/bin/env node

'use strict';

require('../models');
const Config = require('../models/Config');
const baseConfig = require('../core/baseConfig');
const logger = require('../core/logger');

const arg = process.argv[2];


const createConfig = () => {
    Config.create({})
        .then(() => {
            logger.info(`Created configuration.`);

            process.exit(0);
        })
        .catch(err => {
            logger.error('Something went wrong.');
            logger.error(err);

            process.exit(1);
        });
}

const deleteConfig = () => {
    Config.deleteOne()
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
} else {
    logger.info(`Automatically configuring app for state "${baseConfig.state}"...`);

    Config.findOne({ state: baseConfig.state })
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