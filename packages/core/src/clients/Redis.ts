import * as IORedis from 'ioredis';
import type { Logger } from '../types';
import type App from '../structures/App';

export default class Redis extends IORedis {
        private _subredis: IORedis.Redis;
        private _logger: Logger;

        public constructor(app: App) {
                super(
                        app.staticConfig.redis.port,
                        app.staticConfig.redis.host
                );

                const logger = this._logger = app.logger.get('Redis');

                this
                        .on('ready', () => {
                                logger.debug('Connected.');
                        })
                        .on('close', () => {
                                logger.debug('Disconnected.');
                        })
                        .on('error', (err: any) => {
                                logger.debug(err);
                        });
        }

        public get sub(): IORedis.Redis {
                if (!this._subredis) {
                        const logger = this._logger.get('Sub');
                        this._subredis = this.duplicate();
                        this._subredis.on('error', err => logger.error(err));
                }
                return this._subredis;
        }
}
