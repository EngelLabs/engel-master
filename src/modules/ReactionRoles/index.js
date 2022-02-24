const { Module } = require('@engel/core');


class ReactionRoles extends Module {
        constructor() {
                super();

                this.aliases = ['rr', 'reactionrole'];
                this.info = 'Reaction based role management';
                this.disabled = true;
        }
}


module.exports = ReactionRoles;