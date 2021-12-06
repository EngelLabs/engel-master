const Module = require('../../structures/Module');


class Tag extends Module {
    constructor() {
        super();
        
        this.info = 'Create tags for your server';
    }

    commandCheck(ctx) {
        return (
            ctx.bot.checks.isOwner(ctx) ||
            ctx.bot.checks.isServerAdmin(ctx) ||
            ctx.bot.checks.canInvoke(ctx)
        );
    }
}


module.exports = Tag;