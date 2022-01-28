const Client = require('ioredis');
const Base = require('../structures/Base');


class Redis extends Base {
        constructor(bot) {
                super(bot);

                const client = new Client({
                        host: this.baseConfig.redis.host,
                        port: this.baseConfig.redis.port,
                        keepAlive: true,
                });

                client
                        .on('ready', () => {
                                this.log('Connected.', 'info');

                                this.bot._redisIsReady = true;
                        })
                        .on('close', () => {
                                this.log('Disconnected.', 'info');

                                this.bot._redisIsReady = false;
                        })
                        .on('error', err => {
                                this.log(err, 'error');
                        });

                return client;
        }
}


module.exports = Redis;