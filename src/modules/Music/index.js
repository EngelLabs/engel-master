const Module = require('../../core/structures/Module');


class Music extends Module {
    constructor() {
        super();

        this.info = 'Play some music!';
        this.disabled = true;
    }
}


module.exports = Music;