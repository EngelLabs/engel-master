const Module = require('../../structures/Module');


class Automod extends Module {
    constructor() {
        super();
        
        this.aliases = ['AutoModeration'];
        this.info = 'Automate moderation for your server';
    }
}


module.exports = Automod