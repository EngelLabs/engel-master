const Command = require('../../../core/structures/Command');


module.exports = new Command({
    name: 'eval',
    info: 'Evaluate some js',
    usage: '<*code>',
    aliases: ['evaluate', 'e'],
    dmEnabled: true,
    execute: async function (ctx) {
        let { send, message, guild, author, bot, member, channel,
            args, eris, guildConfig, config, baseConfig, logger,
            models, mongoose, database, redis, me, permissions } = ctx,
            __res;

        try {
            __res = await eval(ctx.args.join(' '));
        } catch (err) {
            __res = `Rejection: ${err && err.toString ? err.toString() : err}`;
        }

        if (__res && __res.toString) {
            __res = __res
                .toString()
                .replace(process.env.CLIENT_TOKEN, '[[redacted]]');
        }

        return ctx.send('```js\n' + __res + '\n```');
    },
});