const { parsed, error } = require('dotenv').config();
if (!parsed && error) {
        if (error.code === 'ENOENT') {
                console.error('.env file not found!');

                process.exit(1);
        }

        throw error;
}


import * as getenv from 'getenv';

const NAME = getenv.string('CLIENT_NAME').toUpperCase();


/**
 * Static configuration
 */
export default {
        name: '',
        version: '',
        lib: 'eris',
        env: getenv.string('NODE_ENV'),
        dev: getenv.string('NODE_ENV') === 'development',
        logger: {
                level: getenv.string('LOGGER_LEVEL', 'debug'),
        },
        client: {
                name: getenv.string('CLIENT_NAME'),
                state: getenv.string('CLIENT_STATE'),
                premium: getenv.boolish('CLIENT_' + NAME + '_PREMIUM', false),
                id: getenv.string('CLIENT_' + NAME + '_ID'),
                token: getenv.string('CLIENT_' + NAME + '_TOKEN'),
                secret: getenv.string('CLIENT_' + NAME + '_SECRET'),
        },
        mongo: {
                host: getenv.string('MONGO_HOST', '127.0.0.1'),
                port: getenv.string('MONGO_PORT', '27017'),
                db: getenv.string('MONGO_DATABASE', 'discordbot'),
        },
        redis: {
                host: getenv.string('REDIS_HOST', '127.0.0.1'),
                port: getenv.int('REDIS_PORT', 6379),
        },
};
