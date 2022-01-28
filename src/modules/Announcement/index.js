const Module = require('../../core/structures/Module');


class Announcement extends Module {
        constructor() {
                super();

                this.info = 'Automated announcements';
                this.disabled = true;
        }
}


module.exports = Announcement;