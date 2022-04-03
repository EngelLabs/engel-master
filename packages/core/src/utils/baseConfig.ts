import * as path from 'path';
import * as _env from '@engel/env-util';

const env = new _env.Env({ ignoreMissing: true });

/**
 * Static configuration
 */
export default {
        name: '',
        version: '',
        lib: 'eris',
        env: env.str('NODE_ENV', 'development'),
        dev: env.str('NODE_ENV') === 'development',
        logger: {
                level: env.str('LOGGER_LEVEL', 'debug'),
                dir: path.join(process.cwd(), 'logs')
        },
        client: {
                state: env.str('CLIENT_STATE'),
                premium: env.bool('CLIENT_PREMIUM', false),
                id: env.str('CLIENT_ID'),
                token: env.str('CLIENT_TOKEN'),
                secret: env.str('CLIENT_SECRET')
        },
        mongo: {
                host: env.str('MONGO_HOST', '127.0.0.1'),
                port: env.str('MONGO_PORT', '27017'),
                db: env.str('MONGO_DATABASE', 'discordbot')
        },
        redis: {
                host: env.str('REDIS_HOST', '127.0.0.1'),
                port: env.int('REDIS_PORT', 6379)
        }
};
