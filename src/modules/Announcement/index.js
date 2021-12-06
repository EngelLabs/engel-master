const Module = require('../../structures/Module');


class Announcement extends Module {
    constructor() {
        super();

        this.info = 'Automated announcements';
    }
}


module.exports = Announcement;