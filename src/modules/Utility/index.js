const Module = require('../../structures/Module');


class Utility extends Module {
    constructor() {
        super();

        this.info = 'Commands to provide information about Discord objects';
        this.aliases = ['Util'];
        this.defaultEnabled = true;
    }

    commandCheck(ctx) {
        return (
            ctx.bot.checks.isOwner(ctx) ||
            ctx.bot.checks.isServerAdmin(ctx) ||
            ctx.bot.checks.canInvoke(ctx)
        );
    }
}


module.exports = Utility