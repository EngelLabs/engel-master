const { Module } = require('@engel/core');


class Info extends Module {
        constructor() {
                super();

                this.aliases = ['information'];
                this.info = 'Commands to provide information about the core';
                this.allowedByDefault = true;
        }
}


module.exports = Info;