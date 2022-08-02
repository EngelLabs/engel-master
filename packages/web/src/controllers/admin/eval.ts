/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */

import Controller from '../../core/structures/Controller';

export default new Controller('/admin/eval')
        .get(async (app, req, res) => {
                let { eris, staticConfig, config, logger, mongo, redis } = app;

                let __res: any;

                try {
                        /* eslint-disable-next-line no-eval */
                        __res = await eval(`(async () => { ${req.body.toEval} })()`);

                        if (typeof __res === 'object') {
                                try {
                                        __res = JSON.stringify(__res);
                                } catch { }
                        }

                        if (__res?.toString) {
                                __res = __res
                                        .toString()
                                        .replace(app.staticConfig.client.token, '[[redacted]]');
                        }

                        __res = `Resolved: ${__res}`;
                } catch (err) {
                        __res = `Rejected: ${err?.toString?.() || err}`;
                }

                return res[200](__res);
        });
