const { Command } = require('@engel/core');


module.exports = new Command({
        name: 'source',
        hidden: true,
        cooldown: 60000,
        execute: function (ctx) {
                return ctx.error('Not open source yet, sorry!');
        }
});