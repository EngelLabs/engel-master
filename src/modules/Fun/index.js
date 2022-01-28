const Module = require('../../core/structures/Module');


class Fun extends Module {
        constructor() {
                super();

                this.info = 'Commands that are (hopefully) fun';
                this.disabled = true;
        }
}


module.exports = Fun;