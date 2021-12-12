const Module = require('../../structures/Module');


class ReactionRole extends Module {
    constructor() {
        super();

        this.aliases = ['rr', 'reactionroles'];
        this.info = 'Reaction based role management';
    }
}


module.exports = ReactionRole;