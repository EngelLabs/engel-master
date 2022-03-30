"use strict";
module.exports = async function (app, req, res) {
    let { eris, baseConfig, config, logger, models, mongoose, redis } = app;
    let __res;
    try {
        __res = await eval(`(async () => { ${req.body.toEval} })()`);
        if (typeof __res === 'object') {
            try {
                __res = JSON.stringify(__res);
            }
            catch { }
        }
        if (__res?.toString) {
            __res = __res
                .toString()
                .replace(app.baseConfig.client.token, '[[redacted]]');
        }
        __res = `Resolved: ${__res}`;
    }
    catch (err) {
        __res = `Rejected: ${err?.toString?.() || err}`;
    }
    return app.responses[200](res, __res);
};
//# sourceMappingURL=get.js.map