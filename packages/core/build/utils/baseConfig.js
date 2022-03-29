"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const getenv = require("getenv");
const path = require("path");
const { error } = dotenv.config({ path: path.join(process.cwd(), '../../.env') });
if (error) {
    throw error;
}
exports.default = {
    name: '',
    version: '',
    lib: 'eris',
    env: getenv.string('NODE_ENV', 'development'),
    dev: getenv.string('NODE_ENV') === 'development',
    logger: {
        level: getenv.string('LOGGER_LEVEL', 'debug'),
        dir: ''
    },
    client: {
        state: getenv.string('CLIENT_STATE', ''),
        premium: getenv.boolish('CLIENT_PREMIUM', false),
        id: getenv.string('CLIENT_ID', ''),
        token: getenv.string('CLIENT_TOKEN', ''),
        secret: getenv.string('CLIENT_SECRET', '')
    },
    mongo: {
        host: getenv.string('MONGO_HOST', '127.0.0.1'),
        port: getenv.string('MONGO_PORT', '27017'),
        db: getenv.string('MONGO_DATABASE', 'discordbot')
    },
    redis: {
        host: getenv.string('REDIS_HOST', '127.0.0.1'),
        port: getenv.int('REDIS_PORT', 6379)
    }
};
//# sourceMappingURL=baseConfig.js.map