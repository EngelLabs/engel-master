const Command = require('../../../structures/Command');
const CommandLog = require('../../../models/CommandLog');
const Guild = require('../../../models/Guild');
const Config = require('../../../models/Config');


module.exports = new Command({
    name: 'eval',
    info: 'Evaluate some js',
    usage: '<*code>',
    aliases: ['evaluate', 'e'],
    dmEnabled: true,
    execute: async function (ctx) {
        let { message, guild, author, bot, member, channel,
            args, eris, guildConfig, config, baseConfig, logger } = ctx,
            __res;

        try {
            __res = await Promise.resolve(eval(ctx.args.join(' ')));
        } catch (err) {
            __res = `Rejection: ${err && err.toString ? err.toString() : err}`;
        }

        if (__res && __res.toString) {
            __res = __res
                .toString()
                .replace(process.env.CLIENT_TOKEN, '[[redacted]]');
        }

        return ctx.send('```js\n' + __res + '\n```' );
    },
});