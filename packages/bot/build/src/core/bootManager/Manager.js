"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _cluster = require("cluster");
const getenv = require("getenv");
const path = require("path");
const core = require("@engel/core");
const Cluster_1 = require("./Cluster");
const cluster = _cluster;
class Manager extends core.App {
    clusters = {};
    async start() {
        this.baseConfig.logger.dir = path.resolve('logs');
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
                    const cluster = new Cluster_1.default(this, clusterConfig);
                    this.clusters[clientConfig.name][i] = cluster;
                    await cluster.awaitReady();
                }
            })();
        }
        return Promise.resolve();
    }
}
exports.default = Manager;
//# sourceMappingURL=Manager.js.map