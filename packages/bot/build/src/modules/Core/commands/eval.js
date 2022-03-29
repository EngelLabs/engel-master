"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const superagent = require("superagent");
const Command_1 = require("../../../core/structures/Command");
function _parseBody(ctx) {
    const hasNewLine = ctx.args.find(s => s.includes('\n')) !== undefined;
    let body = ctx.args.join(' ').replace('\n', '') || 'undefined';
    if (body.startsWith('```') && body.endsWith('```')) {
        body = body.slice(3, -3);
        if (body.startsWith('js')) {
            body = body.slice(2).trimLeft();
        }
    }
    if (!body.includes('return') && !hasNewLine) {
        body = `return ${body}`;
    }
    return body;
}
const _eval = new Command_1.default({
    name: 'eval',
    info: 'Evaluate some js',
    usage: '<*code>',
    aliases: ['evaluate', 'e'],
    cooldown: 0,
    dmEnabled: true,
    execute: async function (ctx) {
        let { message, guild, author, core, member, channel, args, eris, guildConfig, baseConfig, config, logger, models, mongoose, redis, me, permissions, utils } = ctx, __ctx = ctx, __res;
        let api = (method, uri, data = {}) => {
            return (superagent[method])('http://localhost:8080/api' + uri)
                .set('Accept', 'application/json')
                .set('User-Agent', __ctx.baseConfig.name)
                .set('Authorization', __ctx.config.apiToken)
                .send(data)
                .then((resp) => { return { s: resp?.status, d: resp?.body?.data }; })
                .catch((err) => { return { s: err?.response?.status, d: err?.response?.body }; });
        };
        const body = _parseBody(ctx);
        try {
            __res = await eval(`(async () => { ${body} })()`);
            if (typeof __res === 'object') {
                try {
                    __res = JSON.stringify(__res);
                }
                catch { }
            }
            if (__res?.toString) {
                __res = __res
                    .toString()
                    .replace(__ctx.baseConfig.client.token, '[[redacted]]');
            }
            __res = `Resolved: ${__res}`;
        }
        catch (err) {
            __res = `Rejected: ${err?.toString?.() || err}`;
        }
        return __ctx.codeblock(__res, 'js')
            .catch(err => ctx.error(err?.toString?.()));
    }
});
_eval.command({
    name: 'web',
    info: 'Evaluate some js on the web server',
    usage: '<*code>',
    aliases: ['w'],
    cooldown: 0,
    dmEnabled: true,
    execute: async function (ctx) {
        let res;
        const body = _parseBody(ctx);
        try {
            res = await superagent
                .get('http://localhost:8080/admin/eval')
                .set('User-Agent', ctx.baseConfig.name)
                .set('Authorization', ctx.config.apiToken)
                .send({ toEval: body })
                .then(resp => resp.text);
        }
        catch (err) {
            res = `Rejected: ${err?.toString?.() || err}`;
        }
        return ctx.codeblock(res, 'js')
            .catch(err => ctx.error(err?.toString?.()));
    }
});
exports.default = _eval;
//# sourceMappingURL=eval.js.map