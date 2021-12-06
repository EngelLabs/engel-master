const Collection = require('../structures/Collection');


class CommandCollection extends Collection {
    constructor(server) {
        super();
        
        this.server = server;
    }

    get(key) {
        return super.get(key && key.toLowerCase ? key.toLowerCase() : key);
    }

    set(key, value) {
        return super.set(key && key.toLowerCase ? key.toLowerCase() : key, value);
    }

    load() {
        const config = this.server.config;

        for (const commandName in config.commands) {
            const command = Object.assign({}, config.commands[commandName]);
            command.name = commandName.split('_').at(-1);
            command.dbName = commandName;
            command.rootName = commandName.split('_')[0];
            command.isSubcommand = commandName.includes('_');

            this.set(command.dbName, command);
        }

        this.server.logger.info(`[Commands] ${this.size} registered.`);
    }
}


module.exports = CommandCollection;