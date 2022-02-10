const Module = require('../../core/structures/Module');


class Levels extends Module {
        constructor() {
                super();

                this.info = 'Level up with server activity, gain xp, and spend it!';
                this.disabled = true;
        }
}


module.exports = Levels;