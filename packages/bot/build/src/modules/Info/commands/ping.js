"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'ping',
    info: 'Calculate the time taken for the bot to send a message',
    aliases: [
        'latency'
    ],
    alwaysEnabled: true,
    dmEnabled: true,
    execute: async function (ctx) {
        const start = Date.now();
        const msg = await ctx.send('Pong!');
        if (msg) {
            const latency = Date.now() - start;
            let text = `Pong! ${latency}ms`;
            if (latency === 69 || latency === 420) {
                text += ' 😏';
            }
            msg.edit(text).catch(() => false);
        }
    }
});
//# sourceMappingURL=ping.js.map