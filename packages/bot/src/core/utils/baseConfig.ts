import * as env from '@engel/env-util';
import { baseConfig } from '@engel/core';
import pkg = require('../../../package.json');

type _BaseConfig = typeof baseConfig & {
        client: {
                name: string;
                shards: number;
                clusters: number;
        };
        cluster: {
                id: number;
                firstShard: number;
                lastShard: number;
                manager: {
                        port: number;
                }
        };
};

const _baseConfig = <_BaseConfig>baseConfig;

_baseConfig.name = pkg.name;
_baseConfig.version = pkg.version;
_baseConfig.client.name = env.str('CLIENT_NAME');
_baseConfig.client.shards = env.int('CLIENT_SHARDS');
_baseConfig.client.clusters = env.int('CLIENT_CLUSTERS');

_baseConfig.cluster = {
        id: env.int('CLUSTER_ID'),
        firstShard: env.int('CLUSTER_FIRST_SHARD'),
        lastShard: env.int('CLUSTER_LAST_SHARD'),
        manager: {
                port: env.int('CLUSTER_MANAGER_PORT', 8050)
        }
};

export default _baseConfig;
