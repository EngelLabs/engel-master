const Module = require('../../structures/Module');


class Ticket extends Module {
    constructor() {
        super();

        this.info = 'Enables server ticket creation';
    }
}


module.exports = Ticket;