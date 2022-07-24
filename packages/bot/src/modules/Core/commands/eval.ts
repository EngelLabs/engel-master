
/* eslint-disable indent */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-newline */
import * as superagent from 'superagent';
import Command from '../../../core/structures/Command';
import type Context from '../../../core/structures/Context';
import type Core from '..';

function _parseBody(ctx: Context): string {
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

const _eval = new Command<Core>({
        name: 'eval',
        info: 'Evaluate some js',
        usage: '<*code>',
        aliases: ['evaluate', 'e'],
        cooldown: 0,
        dmEnabled: true,
        execute: async function (ctx) {
                let { message, guild, author, app, member, channel,
                        args, eris, guildConfig, baseConfig, config, logger,
                        mongo, redis, me, permissions, utils } = ctx,
                        __ctx = ctx, __res: any;

                let api = (method: string, uri: string, data = {}) => {
                        return (superagent[<'get'>method])('http://localhost:8080/api' + uri)
                                .set('Accept', 'application/json')
                                .set('User-Agent', __ctx.baseConfig.name)
                                .set('Authorization', __ctx.config.apiToken)
                                .send(data)
                                .then((resp: superagent.Response) => { return { s: resp?.status, d: resp?.body?.data }; })
                                .catch((err: superagent.ResponseError) => { return { s: err?.response?.status, d: err?.response?.body }; });
                };

                const body = _parseBody(ctx);

                try {
                        /* eslint-disable-next-line no-eval */
                        __res = await eval(`(async () => { ${body} })()`);

                        if (typeof __res === 'object') {
                                try {
                                        __res = JSON.stringify(__res);
                                } catch { }
                        }

                        if (__res?.toString) {
                                __res = __res
                                        .toString()
                                        .replace(__ctx.baseConfig.client.token, '[[redacted]]');
                        }

                        __res = `Resolved: ${__res}`;
                } catch (err) {
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
                        /* eslint-disable-next-line no-eval */
                        res = await superagent
                                .get('http://localhost:8080/admin/eval')
                                .set('User-Agent', ctx.baseConfig.name)
                                .set('Authorization', ctx.config.apiToken)
                                .send({ toEval: body })
                                .then(resp => resp.text);
                } catch (err) {
                        res = `Rejected: ${err?.toString?.() || err}`;
                }

                return ctx.codeblock(res, 'js')
                        .catch(err => ctx.error(err?.toString?.()));
        }
});

export default _eval;
