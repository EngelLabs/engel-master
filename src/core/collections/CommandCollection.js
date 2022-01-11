const Collection = require('../structures/Collection');


class CommandCollection extends Collection {
    constructor(server) {
        super();
        
        this.server = server;
        this.load();
    }

    load() {
        const commands = this.server.config.commands;
        const logger = this.server.logger;

        for (const key in commands) {
            const command = Object.assign({}, commands[key]);
            command.rootName = command.name.split('_')[0];
            command.isSubcommand = command.name.includes('_');

            this.set(command.name, command);
            logger.debug(`[Commands] Loaded "${command.name}"`);
        }

        logger.info(`[Commands] ${this.size} registered.`);
    }
}


module.exports = CommandCollection;