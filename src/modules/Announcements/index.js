const Module = require('../../core/structures/Module');


class Announcements extends Module {
        constructor() {
                super();

                this.info = 'Automated announcements';
                this.disabled = true;
        }
}


module.exports = Announcements;