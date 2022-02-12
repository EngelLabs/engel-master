const { Module } = require('@timbot/core');


class Fun extends Module {
        constructor() {
                super();

                this.info = 'Commands that are (hopefully) fun';
                this.disabled = true;
        }
}


module.exports = Fun;