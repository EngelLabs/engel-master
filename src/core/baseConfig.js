'use-strict';

require('dotenv').config();
const pkg = require('../../package.json');


module.exports = {
    name: pkg.name,
    version: pkg.version,
    port: process.env.SITE_PORT,
    secret: process.env.SITE_SECRET,
    env: process.env.NODE_ENV,
    state: process.env.STATE,
    logLevel: process.env.LOG_LEVEL || 'debug',
    client: {
        id: process.env.CLIENT_ID,
        token: process.env.CLIENT_TOKEN,
        secret: process.env.CLIENT_SECRET,
    },
    mongoUri: process.env.MONGO_URI,
    redis: {
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
    },
    defaultOptions: {
        eris: {
            restMode: true,
        },
    },
};