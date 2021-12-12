const Module = require('../../structures/Module');


class Admin extends Module {
    constructor() {
        super();

        this.private = true;
        this.info = 'Admin-only commands';
    }

    commandCheck(ctx) {
        return ctx.author.id === ctx.config.author.id;
    }
}


module.exports = Admin;