"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const Command_1 = require("../../../core/structures/Command");
exports.default = new Command_1.default({
    name: 'speedtest',
    info: 'Run a speedtest',
    dmEnabled: true,
    execute: function (ctx) {
        return new Promise((resolve, reject) => {
            ctx.addLoadingReaction().catch(() => false);
            childProcess.exec('speedtest --json --share', (err, stdout, stderr) => {
                ctx.removeLoadingReaction().catch(() => false);
                if (err)
                    return reject(err);
                if (stdout) {
                    let parsed;
                    try {
                        parsed = JSON.parse(stdout);
                    }
                    catch (err) {
                        ctx.codeblock(err?.toString?.() || err);
                    }
                    if (parsed) {
                        ctx.send(parsed.share);
                    }
                }
                if (stderr) {
                    ctx.codeblock(stderr.toString());
                }
                resolve();
            });
        });
    }
});
//# sourceMappingURL=speedtest.js.map