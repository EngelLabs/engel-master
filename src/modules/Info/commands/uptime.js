const Command = require('../../../core/structures/Command');
const prettyMS = require('pretty-ms');


module.exports = new Command({
    name: 'uptime',
    info: 'Get the bot\'s uptime',
    dmEnabled: true,
    alwaysEnabled: true,
    cooldown: 10000,
    execute: function (ctx) {
        return ctx.loading(`Uptime: ${prettyMS(Math.floor(process.uptime()) * 1000)}`);
    }
});