import * as childProcess from 'child_process';
import Command from '../../../core/structures/Command';
import type Core from '..';

export default new Command<Core>({
        name: 'speedtest',
        info: 'Run a speedtest',
        dmEnabled: true,
        execute: function (ctx) {
                return new Promise<void>((resolve, reject) => {
                        ctx.addLoadingReaction().catch(() => false);

                        childProcess.exec('speedtest --json --share', (err, stdout, stderr) => {
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
});
