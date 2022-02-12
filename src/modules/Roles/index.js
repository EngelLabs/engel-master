const { Module } = require('@timbot/core');


class Roles extends Module {
        constructor() {
                super();

                this.info = 'Commands to manage server roles';
        }
}


module.exports = Roles;