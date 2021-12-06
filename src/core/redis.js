const Redis = require('ioredis');
const baseConfig = require('./baseConfig');
const logger = require('./logger');


const redis = new Redis({
    port: baseConfig.redis.port,
    host: baseConfig.redis.host,
});

redis.on('ready', () => {
    logger.info('[Redis] Connected.');
});

redis.on('error', err => {
    logger.error('[Redis] Something went wrong.');
    console.error(err);
});


module.exports = redis;