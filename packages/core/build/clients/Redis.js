"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis = require("ioredis");
const IORedis = ioredis;
function Redis(app, shouldLog = true) {
    const client = new IORedis(app.baseConfig.redis.port, app.baseConfig.redis.host);
    if (shouldLog) {
        const log = (message, level, prefix = 'Redis') => {
            app.log(message, level, prefix);
        };
        client
            .on('ready', () => {
            log('Connected.');
        })
            .on('close', () => {
            log('Disconnected.');
        })
            .on('error', (err) => {
            log(err, 'error');
        });
    }
    return client;
}
exports.default = Redis;
//# sourceMappingURL=Redis.js.map