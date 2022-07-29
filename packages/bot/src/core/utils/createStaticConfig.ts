import * as deepmerge from 'deepmerge';
import * as env from '@engel/env-util';
import * as core from '@engel/core';
import type * as types from '@engel/types';
import pkg = require('../../../package.json');

export default function createStaticConfig(): types.CustomStaticConfig {
        const staticConfig = core.createStaticConfig(pkg);

        return deepmerge(staticConfig, {
                client: {
                        name: env.str('CLIENT_NAME'),
                        shards: env.int('CLIENT_SHARDS'),
                        clusters: env.int('CLIENT_CLUSTERS')
                },
                cluster: {
                        id: env.int('CLUSTER_ID'),
                        firstShard: env.int('CLUSTER_FIRST_SHARD'),
                        lastShard: env.int('CLUSTER_LAST_SHARD'),
                        manager: {
                                port: env.int('CLUSTER_MANAGER_PORT', 8050)
                        }
                }
        });
}
