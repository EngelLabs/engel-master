const { Module } = require('@engel/core');

class Roles extends Module {
        constructor() {
                super();

                this.info = 'Commands to manage server roles';
        }
}

module.exports = Roles;
