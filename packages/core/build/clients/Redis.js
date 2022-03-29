"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis = require("ioredis");
const IORedis = ioredis;
function Redis(core, shouldLog = true) {
    const client = new IORedis(core.baseConfig.redis.port, core.baseConfig.redis.host);
    if (shouldLog) {
        const log = (message, level, prefix = 'Redis') => {
            core.log(message, level, prefix);
        };
        client
            .on('ready', () => {
            log('Connected.', 'info');
        })
            .on('close', () => {
            log('Disconnected.', 'info');
        })
            .on('error', (err) => {
            log(err, 'error');
        });
    }
    return client;
}
exports.default = Redis;
//# sourceMappingURL=Redis.js.map