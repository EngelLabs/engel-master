"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getenv = require("getenv");
const path = require("path");
const core_1 = require("@engel/core");
const pkg = require("../../../package.json");
const _baseConfig = core_1.baseConfig;
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
exports.default = _baseConfig;
//# sourceMappingURL=baseConfig.js.map