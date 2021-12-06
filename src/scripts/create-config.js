#! usr/bin/env node

'use strict';

require('../models').setup();
const Config = require('../models/Config');
const logger = require('../core/logger);


const doc = new Config();

doc.save()
    .then(config => {
        logger.info(`Created configuration for state ${config.state} from existing template.`);

        process.exit(0);
    })
    .catch(err => {
        logger.error('Something went wrong.');
        logger.error(err);

        process.exit(1);
    });