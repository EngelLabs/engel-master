const { Module } = require('@timbot/core');


class Announcements extends Module {
        constructor() {
                super();

                this.info = 'Automated announcements';
                this.disabled = true;
        }
}


module.exports = Announcements;