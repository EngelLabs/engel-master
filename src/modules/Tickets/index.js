const Module = require('../../core/structures/Module');


class Tickets extends Module {
        constructor() {
                super();

                this.info = 'Enables server ticket creation';
                this.disabled = true;
        }
}


module.exports = Tickets;