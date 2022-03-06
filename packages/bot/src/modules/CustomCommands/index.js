const { Module } = require('@engel/core');

class CustomCommands extends Module {
        constructor() {
                super();

                this.dbName = 'cc';
                this.aliases = ['cc', 'customcommands'];
                this.info = 'Create custom bot commands for your server';
                this.disabled = true;
        }
}

module.exports = CustomCommands;
