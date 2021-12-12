const Module = require('../../structures/Module');


class Utility extends Module {
    constructor() {
        super();

        this.info = 'Commands to provide information about Discord objects';
        this.aliases = ['util', 'utils'];
        this.defaultEnabled = true;
    }
}


module.exports = Utility