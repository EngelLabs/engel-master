"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prettyMS = require("pretty-ms");
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'uptime',
    info: 'Get the bot\'s uptime',
    dmEnabled: true,
    alwaysEnabled: true,
    cooldown: 10000,
    execute: function (ctx) {
        return ctx.info(`Uptime: ${prettyMS(Math.floor(process.uptime()) * 1000)}`);
    }
});
//# sourceMappingURL=uptime.js.map