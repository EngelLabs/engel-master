const Command = require('../../../core/structures/Command');


module.exports = new Command({
        name: 'source',
        hidden: true,
        cooldown: 60000,
        execute: function (ctx) {
                return ctx.error('Not open source yet, sorry!');
        }
});