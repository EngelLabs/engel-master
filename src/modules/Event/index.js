const Module = require('../../structures/Module');


class Event extends Module {
    constructor() {
        super();

        this.info = 'Conduct a server event.';
    }
}


module.exports = Event;