"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const baseConfig_1 = require("../utils/baseConfig");
const globalDefaults_1 = require("../utils/globalDefaults");
const configSchemaBase = { state: { type: String, default: baseConfig_1.default.client.state } };
for (const key in globalDefaults_1.default) {
    const value = globalDefaults_1.default[key];
    configSchemaBase[key] = { type: value.constructor, default: value };
}
const configSchema = new mongoose.Schema(configSchemaBase, { collection: 'configurations', minimize: false });
configSchema.index({ state: 1 }, { unique: true });
const Config = mongoose.model('Config', configSchema);
exports.default = Config;
//# sourceMappingURL=Config.js.map