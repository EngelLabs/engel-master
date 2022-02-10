const Module = require('../../core/structures/Module');


class Giveaways extends Module {
        constructor() {
                super();

                this.info = 'Conduct server giveaways';
                this.disabled = true;
        }
}


module.exports = Giveaways;