const Module = require('../../core/structures/Module');


class Event extends Module {
        constructor() {
                super();

                this.info = 'Conduct a server event.';
                this.disabled = true;
        }
}


module.exports = Event;