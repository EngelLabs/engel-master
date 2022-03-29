import * as getenv from 'getenv';
import * as path from 'path';
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
        };
};

const _baseConfig = <_BaseConfig>baseConfig;

_baseConfig.name = pkg.name;
_baseConfig.version = pkg.version;
_baseConfig.logger.dir = path.resolve('logs');
_baseConfig.client.name = getenv.string('CLIENT_NAME');
_baseConfig.client.shards = getenv.int('CLIENT_SHARDS');
_baseConfig.client.clusters = getenv.int('CLIENT_CLUSTERS');

_baseConfig.cluster = {
        id: getenv.int('CLUSTER_ID'),
        firstShard: getenv.int('CLUSTER_FIRST_SHARD'),
        lastShard: getenv.int('CLUSTER_LAST_SHARD')
};

export default _baseConfig;
