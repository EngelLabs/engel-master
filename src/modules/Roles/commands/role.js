const { Command } = require('@engel/core');


const role = new Command({
        name: 'role',
        options: [
                { name: 'add', alias: 'a', type: Boolean },
                { name: 'remove', alias: 'r', type: Boolean },
                { name: 'toggle', alias: 't', type: Boolean, default: true },
        ],
        execute: async function (ctx) {

        }
});


module.exports = role;