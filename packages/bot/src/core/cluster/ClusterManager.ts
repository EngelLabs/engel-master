import * as _cluster from 'cluster';
import * as jayson from 'jayson/promise';
import * as env from '@engel/env-util';
import * as core from '@engel/core';
import type * as types from '@engel/types';
import Cluster from './Cluster';
import RPCMethods from './RPCMethods';
import type Queue from 'queue';

const cluster = <_cluster.Cluster><unknown>_cluster;

export default class ClusterManager extends core.App {
        public processes: Map<number, Cluster>;
        public queues: Map<string, Queue>;
        private server: jayson.Server;

        public start(): Promise<void> {
                const port = env.int('CLUSTER_MANAGER_PORT', 8050);

                this.processes = new Map();
                this.queues = new Map();

                this.staticConfig = core.createStaticConfig();
                this.logger = core.createLogger(this);
                this.redis = new core.Redis(this);

                const logger = this.logger.get('ClusterManager');

                cluster.setupPrimary({
                        silent: !this.staticConfig.dev,
                        exec: 'build/src/index.js'
                });

                const methods = (new RPCMethods(this)).map;
                this.server = new jayson.Server(methods);
                this.server
                        .http()
                        .on('error', err => logger.error(err))
                        .on('listening', () => this.startAllClients())
                        .listen(port);

                return Promise.resolve();
        }

        private startAllClients(): void {
                const clientNames = env.arr('CLIENT_NAMES');
                const clusterCount = env.int('CLUSTER_COUNT', 1);
                const shardCount = env.int('SHARD_COUNT', 1);

                const clientConfigs: types.ClientConfig[] = [];

                let firstClusterID = 0;

                for (const clientName of clientNames) {
                        const NAME = clientName.toUpperCase();

                        const clientClusterCount = env.int('CLIENT_' + NAME + '_CLUSTERS', clusterCount);
                        const clientShardCount = env.int('CLIENT_' + NAME + '_SHARDS', shardCount);

                        clientConfigs.push({
                                env: {
                                        CLIENT_NAME: clientName,
                                        CLIENT_STATE: env.str('CLIENT_' + NAME + '_STATE', this.staticConfig.client.state),
                                        CLIENT_PREMIUM: env.bool('CLIENT_' + NAME + '_PREMIUM', false),
                                        CLIENT_ID: env.str('CLIENT_' + NAME + '_ID'),
                                        CLIENT_TOKEN: env.str('CLIENT_' + NAME + '_TOKEN'),
                                        CLIENT_SECRET: env.str('CLIENT_' + NAME + '_SECRET'),
                                        CLIENT_SHARDS: clientClusterCount * clientShardCount,
                                        CLIENT_CLUSTERS: clientClusterCount
                                },
                                name: clientName,
                                firstClusterID: firstClusterID,
                                clusterCount: clientClusterCount,
                                shardCount: clientShardCount
                        });

                        firstClusterID += clientClusterCount;
                }

                clientConfigs.forEach(config => this.startClient(config));
        }

        private startClient(clientConfig: types.ClientConfig): void {
                let firstShardID = 0;
                let lastShardID = clientConfig.shardCount - 1;

                for (let i = clientConfig.firstClusterID; i < clientConfig.clusterCount + clientConfig.firstClusterID; i++) {
                        const clusterConfig: types.ClusterConfig = {
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

                        this.startCluster(clusterConfig);
                }
        }

        private startCluster(clusterConfig: types.ClusterConfig): void {
                const cluster = new Cluster(this, clusterConfig);
                this.processes.set(clusterConfig.id, cluster);

                cluster.spawn();
        }
}
