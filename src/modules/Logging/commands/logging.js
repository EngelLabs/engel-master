const Command = require('../../../core/structures/Command');


const logging = new Command({
    name: 'logging',
    aliases: ['log'],
    info: 'Configure the Logging module for your server',
    execute: function (ctx) {
        return ctx.error('Yet to be implemented');
    }
});


module.exports = logging;