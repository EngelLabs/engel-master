const baseConfig = require('../core/baseConfig');
const logger = require('../core/logger');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, '.');

if (!mongoose.SchemaTypes.Long || !mongoose.Schema.Types.Long) {
    require('mongoose-long')(mongoose);
}

for (const dir of fs.readdirSync(modelsPath)) {
    try {
        require(modelsPath + '/' + dir);
    } catch (err) {
        logger.error('[Mongoose] Something went wrong.');
        console.error(err);
    }
}

logger.info(`[Mongoose] ${Object.values(mongoose.models).length} models registered.`);

mongoose.connect(baseConfig.mongoUri, {
    connectTimeoutMS: 30000,
    keepAlive: true,
});

mongoose.connection.once('connected', () => {
    logger.info('[Mongoose] Connected.');
});

mongoose.connection.on('error', err => {
    logger.error('[Mongoose] Something went wrong.');
    console.error(err);
});


module.exports = mongoose;