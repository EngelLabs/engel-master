"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Module_1 = require("../../core/structures/Module");
class Info extends Module_1.default {
    constructor() {
        super();
        this.aliases = ['information'];
        this.info = 'Commands to provide information about the bot';
        this.allowedByDefault = true;
    }
}
exports.default = Info;
//# sourceMappingURL=index.js.map