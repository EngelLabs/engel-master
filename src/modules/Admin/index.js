const Module = require('../../core/structures/Module');
const Command = require('../../core/structures/Command');


class Admin extends Module {
    constructor() {
        super();

        this.private = true;
        this.info = 'Admin-only commands';
    }

    injectHook() {
        const admin = new Command({
            name: 'admin',
            aliases: ['a'],
            namespace: true,
            hidden: true,
            info: 'Namespace for admin commands',
        });

        for (const command of this.commands) {
            command.parent = admin;
        }

        this.commands = [admin];
    }

    commandCheck(ctx) {
        return ctx.author.id === ctx.config.author.id;
    }
}


module.exports = Admin;