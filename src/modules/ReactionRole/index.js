const Module = require('../../core/structures/Module');


class ReactionRole extends Module {
        constructor() {
                super();

                this.aliases = ['rr', 'reactionroles'];
                this.info = 'Reaction based role management';
                this.disabled = true;
        }
}


module.exports = ReactionRole;