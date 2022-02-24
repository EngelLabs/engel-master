const { Command } = require('@engel/core');
const prettyMS = require('pretty-ms');


module.exports = new Command({
        name: 'uptime',
        info: 'Get the core\'s uptime',
        dmEnabled: true,
        alwaysEnabled: true,
        cooldown: 10000,
        execute: function (ctx) {
                return ctx.info(`Uptime: ${prettyMS(Math.floor(process.uptime()) * 1000)}`);
        }
});