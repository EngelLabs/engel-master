const Module = require('../../core/structures/Module');


class Level extends Module {
        constructor() {
                super();

                this.info = 'Level up with server activity, gain xp, and spend it!';
                this.disabled = true;
        }
}


module.exports = Level;