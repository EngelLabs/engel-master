const { parsed, error } = require('dotenv').config();
if (!parsed && error) {
        if (error.code === 'ENOENT') {
                console.error('.env file not found!');

                process.exit(1);
        }

        throw error;
}


const getenv = require('getenv');
const package = require('../../../package.json');


module.exports = {
        name: package.name,
        version: package.version,
        env: process.env.NODE_ENV,
        dev: process.env.NODE_ENV === 'development',
        logger: {
                level: getenv.string('LOGGER_LEVEL', 'debug'),
        },
        site: {
                host: getenv.string('SITE_HOST', 'localhost'),
                port: getenv.string('SITE_PORT', '8080'),
                secret: getenv.string('SITE_SECRET'),
        },
        client: {
                id: getenv.string('CLIENT_ID'),
                token: getenv.string('CLIENT_TOKEN'),
                secret: getenv.string('CLIENT_SECRET'),
                state: getenv.string('CLIENT_STATE'),
        },
        mongo: {
                host: getenv.string('MONGO_HOST', '127.0.0.1'),
                port: getenv.string('MONGO_PORT', '27017'),
                db: getenv.string('MONGO_DATABASE', 'discordbot'),
        },
        redis: {
                host: getenv.string('REDIS_HOST', '127.0.0.1'),
                port: getenv.string('REDIS_PORT', '6379'),
        },
};