const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'eval',
        info: 'Evaluate some js',
        usage: '<*code>',
        aliases: ['evaluate', 'e'],
        dmEnabled: true,
        execute: async function (ctx) {
                let { message, guild, author, bot, member, channel,
                        args, eris, guildConfig, config, config, logger,
                        models, mongoose, database, redis, me, permissions } = ctx,
                        __res;

                try {
                        __res = `Resolved: ${await eval(`(async () => { await (${ctx.args.join(' ')}); })()`)}`;
                } catch (err) {
                        __res = `Rejected: ${err && err.toString ? err.toString() : err}`;
                }

                if (__res && __res.toString) {
                        __res = __res
                                .toString()
                                .replace(ctx.config.client.token, '[[redacted]]');
                }

                return ctx.codeblock(__res, 'js');
        },
});