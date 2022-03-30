/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        let { eris, baseConfig, config, logger, models, mongoose, redis } = app;

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
                                .replace(app.baseConfig.client.token, '[[redacted]]');
                }

                __res = `Resolved: ${__res}`;
        } catch (err) {
                __res = `Rejected: ${err?.toString?.() || err}`;
        }

        return app.responses[200](res, __res);
}
