import * as _cluster from 'cluster';
import * as env from '@engel/env-util';
import * as core from '@engel/core';
import Cluster from './Cluster';

const cluster = _cluster as unknown as _cluster.Cluster;

export default class Manager extends core.App {
        private clusters: { [key: string]: { [key: number]: Cluster } } = {}

        public async start() {
                this.logger = core.Logger(this);

                const clientNames = env.arr('CLIENT_NAMES');
                const clusterCount = env.int('CLUSTER_COUNT', 1);
                const shardCount = env.int('SHARD_COUNT', 1);

                const clients = [];

                for (const clientName of clientNames) {
                        const NAME = clientName.toUpperCase();

                        const clientClusterCount = env.int('CLIENT_' + NAME + '_CLUSTERS', clusterCount);
                        const clientShardCount = env.int('CLIENT_' + NAME + '_SHARDS', shardCount);

                        clients.push({
                                env: {
                                        CLIENT_NAME: clientName,
                                        CLIENT_STATE: env.str('CLIENT_' + NAME + '_STATE', this.baseConfig.client.state),
                                        CLIENT_PREMIUM: env.bool('CLIENT_' + NAME + '_PREMIUM', false),
                                        CLIENT_ID: env.str('CLIENT_' + NAME + '_ID'),
                                        CLIENT_TOKEN: env.str('CLIENT_' + NAME + '_TOKEN'),
                                        CLIENT_SECRET: env.str('CLIENT_' + NAME + '_SECRET'),
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

                for (const clientConfig of clients) {
                        (async () => {
                                let firstShardID = 0;
                                let lastShardID = clientConfig.shardCount - 1;

                                for (let i = 0; i < clientConfig.clusterCount; i++) {
                                        const clusterConfig = {
                                                id: i,
                                                client: clientConfig.name,
                                                firstShardID,
                                                lastShardID,
                                                env: Object.assign({
                                                        CLUSTER_FIRST_SHARD: firstShardID,
                                                        CLUSTER_LAST_SHARD: lastShardID,
                                                        CLUSTER_ID: i
                                                }, clientConfig.env)
                                        };

                                        firstShardID += clientConfig.shardCount;
                                        lastShardID += clientConfig.shardCount;

                                        this.clusters[clientConfig.name] = this.clusters[clientConfig.name] || {};

                                        const cluster = new Cluster(this, clusterConfig);

                                        this.clusters[clientConfig.name][i] = cluster;

                                        await cluster.awaitReady();
                                }
                        })();
                }

                return Promise.resolve();
        }
}
