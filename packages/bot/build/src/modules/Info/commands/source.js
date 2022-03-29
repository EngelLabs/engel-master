"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'source',
    hidden: true,
    cooldown: 60000,
    execute: function (ctx) {
        return ctx.error('Not open source yet, sorry!');
    }
});
//# sourceMappingURL=source.js.map