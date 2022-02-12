const { Module } = require('@timbot/core');


class Music extends Module {
        constructor() {
                super();

                this.info = 'Play some music!';
                this.disabled = true;
        }
}


module.exports = Music;