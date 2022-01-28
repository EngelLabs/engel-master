const Module = require('../../core/structures/Module');


class Utility extends Module {
        constructor() {
                super();

                this.info = 'Commands to provide information about Discord objects';
                this.aliases = ['util', 'utils'];
                this.allowedByDefault = true;
        }
}


module.exports = Utility