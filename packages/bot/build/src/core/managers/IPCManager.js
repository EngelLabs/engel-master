"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Base_1 = require("../structures/Base");
class IPCManager extends Base_1.default {
    send(op, data) {
        const d = {
            data,
            client: this.baseConfig.client.name,
            cluster: this.baseConfig.cluster.id
        };
        if (!process.connected) {
            return false;
        }
        process.send({ op, d });
    }
}
exports.default = IPCManager;
//# sourceMappingURL=IPCManager.js.map