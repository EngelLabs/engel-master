const { Module } = require('@timbot/core');


class Events extends Module {
        constructor() {
                super();

                this.info = 'Conduct a server event.';
                this.disabled = true;
        }
}


module.exports = Events;