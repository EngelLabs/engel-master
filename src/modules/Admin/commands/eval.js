const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'eval',
        info: 'Evaluate some js',
        usage: '<*code>',
        aliases: ['evaluate', 'e'],
        cooldown: 0,
        dmEnabled: true,
        execute: async function (ctx) {
                let { message, guild, author, bot, member, channel,
                        args, eris, guildConfig, baseConfig, config, logger,
                        models, mongoose, redis, me, permissions } = ctx,
                        __ctx = ctx, __res;

                let api = (method, uri, data = {}) => {
                        const superagent = require('superagent');

                        return superagent[method]('http://localhost:8080/api' + uri)
                                .set('Accept', 'application/json')
                                .set('User-Agent', __ctx.baseConfig.name)
                                .set('Authorization', __ctx.config.apiToken)
                                .send(data)
                                .then(resp => { return { s: resp?.status, d: resp?.body?.data } })
                                .catch(err => { return { s: err?.response?.status, d: err?.response?.body } });
                }

                let body = __ctx.args.join(' ').replace('\n', '') || 'undefined';

                if (body.startsWith('```') && body.endsWith('```')) {
                        body = body.slice(3, -3);

                        if (body.startsWith('js')) {
                                body = body.slice(2).trimLeft();
                        }
                }

                if (!body.includes('return')) {
                        body = `return ${body}`;
                }

                try {
                        __res = await eval(`(async () => { ${body} })()`);

                        if (typeof __res === 'object') {
                                try {
                                        __res = JSON.stringify(__res);
                                } catch { }
                        }

                        if (__res && __res.toString) {
                                __res = __res
                                        .toString()
                                        .replace(__ctx.baseConfig.client.token, '[[redacted]]');
                        }

                        __res = `Resolved: ${__res}`;
                } catch (err) {
                        __res = `Rejected: ${err?.toString?.() || err}`;
                }

                return __ctx.codeblock(__res, 'js');
        },
});