const Module = require('../../structures/Module');


class Logging extends Module {
    constructor() {
        super();

        this.aliases = ['ServerLogging'];
        this.info = 'Enables logging various server events to channels';
    }
}


module.exports = Logging