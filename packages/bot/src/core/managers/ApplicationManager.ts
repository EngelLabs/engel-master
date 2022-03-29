import * as _cluster from 'cluster';
import * as getenv from 'getenv';
import * as core from '@engel/core';

const cluster = _cluster as unknown as _cluster.Cluster;

export default class ApplicationManager extends core.Core {
        private clusters: { [key: string]: { [key: number]: _cluster.Worker } } = {}

        public async start() {
                this.logger = core.Logger(this);

                const clientNames = getenv.array('CLIENT_NAMES');
                const clusterCount = getenv.int('CLUSTER_COUNT', 1);
                const shardCount = getenv.int('SHARD_COUNT', 1);

                const clients = [];

                for (const clientName of clientNames) {
                        const NAME = clientName.toUpperCase();

                        const clientClusterCount = getenv.int('CLIENT_' + NAME + '_CLUSTERS', clusterCount);
                        const clientShardCount = getenv.int('CLIENT_' + NAME + '_SHARDS', shardCount);

                        clients.push({
                                env: {
                                        CLIENT_NAME: clientName,
                                        CLIENT_STATE: getenv.string('CLIENT_' + NAME + '_STATE', this.baseConfig.client.state),
                                        CLIENT_PREMIUM: getenv.bool('CLIENT_' + NAME + '_PREMIUM', false),
                                        CLIENT_ID: getenv.string('CLIENT_' + NAME + '_ID'),
                                        CLIENT_TOKEN: getenv.string('CLIENT_' + NAME + '_TOKEN'),
                                        CLIENT_SECRET: getenv.string('CLIENT_' + NAME + '_SECRET'),
                                        CLIENT_SHARDS: clientClusterCount * clientShardCount,
                                        CLIENT_CLUSTERS: clientClusterCount
                                },
                                name: clientName,
                                clusterCount: clientClusterCount,
                                shardCount: clientShardCount
                        });
                }

                cluster.setupPrimary({
                        silent: !this.baseConfig.dev,
                        exec: 'build/src/index.js'
                });

                cluster
                        .on('online', worker => {
                                this.log('Online.', 'info', `PID-${worker.process.pid}`);
                        })
                        .on('disconnect', worker => {
                                this.log('Offfline.', 'info', `PID-${worker.process.pid}`);
                        });

                for (const clientConfig of clients) {
                        (async () => {
                                let firstShardID = 0;
                                let lastShardID = clientConfig.shardCount - 1;

                                for (let i = 0; i < clientConfig.clusterCount; i++) {
                                        const env = Object.assign({
                                                CLUSTER_FIRST_SHARD: firstShardID,
                                                CLUSTER_LAST_SHARD: lastShardID,
                                                CLUSTER_ID: i
                                        }, clientConfig.env);

                                        firstShardID += clientConfig.shardCount;
                                        lastShardID += clientConfig.shardCount;

                                        this.clusters[clientConfig.name] = this.clusters[clientConfig.name] || {};
                                        const worker = this.clusters[clientConfig.name][i] = cluster.fork(env);

                                        await new Promise((resolve) => {
                                                const listener = (message: any) => {
                                                        if (message === 'ready') {
                                                                worker.off('message', listener);

                                                                resolve(null);
                                                        }
                                                };

                                                worker.on('message', listener);
                                        });
                                }
                        })();
                }

                return Promise.resolve();
        }
}
