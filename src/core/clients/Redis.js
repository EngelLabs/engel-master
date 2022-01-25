const Client = require('ioredis');
const Base = require('../structures/Base');


class Redis extends Base {
        constructor(server) {
                super(server);

                const { redis } = this.baseConfig;

                const client = new Client({
                        host: redis.host,
                        port: redis.port,
                        keepAlive: true,
                        connectTimeout: 4500,
                });

                client
                        .on('ready', () => {
                                this.log('Connected.');
                        })
                        .on('close', () => {
                                this.log('Disconnected.');
                        })
                        .on('error', err => {
                                this.log(err, 'error');
                        });

                return client;
        }
}


module.exports = Redis;