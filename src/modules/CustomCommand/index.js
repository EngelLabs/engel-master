const Module = require('../../structures/Module');


class CustomCommand extends Module {
    constructor() {
        super();

        this.info = 'Create custom bot commands for your server';
    }
}


module.exports = CustomCommand;