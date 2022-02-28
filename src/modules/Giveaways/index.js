const { Module } = require('@engel/core');

class Giveaways extends Module {
        constructor() {
                super();

                this.info = 'Conduct server giveaways';
                this.disabled = true;
        }
}

module.exports = Giveaways;
