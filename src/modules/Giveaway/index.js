const Module = require('../../core/structures/Module');


class Giveaway extends Module {
    constructor() {
        super();

        this.info = 'Conduct server giveaways';
        this.disabled = true;
    }
}


module.exports = Giveaway;