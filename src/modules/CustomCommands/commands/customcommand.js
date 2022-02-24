const { Command } = require('@engel/core');


COMMAND_TYPES = {
        '0': 'Text',
        '1': 'Embed',
        '2': 'Reaction',
}

const customcommand = new Command({
        name: 'customcommand',
        usage: '<command name> <type> <*response>',
        info: 'Manage custom commands for your server',
        requiredArgs: 1,
        execute: function (ctx) {
                return ctx.error('Not implemented yet, sorry.')
        }
});


module.exports = customcommand;