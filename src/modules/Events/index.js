const Module = require('../../core/structures/Module');


class Events extends Module {
        constructor() {
                super();

                this.info = 'Conduct a server event.';
                this.disabled = true;
        }
}


module.exports = Events;