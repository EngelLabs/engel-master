"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getenv = require("getenv");
const path = require("path");
const core_1 = require("@engel/core");
const pkg = require("../../../package.json");
core_1.baseConfig.name = pkg.name;
core_1.baseConfig.version = pkg.version;
core_1.baseConfig.logger.dir = path.resolve('logs');
core_1.baseConfig.site = {
    host: getenv.string('SITE_HOST', 'localhost'),
    port: getenv.string('SITE_PORT', '8080'),
    secret: getenv.string('SITE_SECRET')
};
exports.default = core_1.baseConfig;
//# sourceMappingURL=baseConfig.js.map