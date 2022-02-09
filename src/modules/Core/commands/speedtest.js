const { exec } = require('child_process');
const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'speedtest',
        info: 'Run a speedtest',
        dmEnabled: true,
        execute: function (ctx) {
                return new Promise((resolve, reject) => {
                        ctx.addLoadingReaction().catch(() => false);

                        exec('speedtest --json --share', (err, stdout, stderr) => {
                                ctx.removeLoadingReaction().catch(() => false);

                                if (err) return reject(err);

                                if (stdout) {
                                        let parsed;

                                        try {
                                                parsed = JSON.parse(stdout);
                                        } catch (err) {
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
})