const Module = require('../../structures/Module');


class Admin extends Module {
    constructor() {
        super();

        this.private = true;
        this.info = 'Admin-only commands';
    }

    async commandCheck(ctx) {
        return ctx.author.id === ctx.config.author.id;
    }
}


module.exports = Admin;