const baseConfig = require('../core/baseConfig');
const logger = require('../core/logger');
const mongoose = require('mongoose');

if (!mongoose.SchemaTypes.Long || !mongoose.Schema.Types.Long) {
    require('mongoose-long')(mongoose);
}

mongoose.connect(baseConfig.mongoUri, {
    connectTimeoutMS: 30000,
    keepAlive: true,
});

mongoose.connection.once('connected', () => {
    logger.info('[MongoDB] Connected.')
});

mongoose.connection.on('error', err => {
    logger.error('[MongoDB] Something went wrong.');
    console.error(err);
});


module.exports = mongoose.connection;