"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../core/structures/Module");
class Utility extends Module_1.default {
    constructor() {
        super();
        this.info = 'Commands to provide information about Discord objects';
        this.aliases = ['util', 'utils'];
        this.allowedByDefault = true;
    }
}
exports.default = Utility;
//# sourceMappingURL=index.js.map