const Collection = require('../structures/Collection');


class ModuleCollection extends Collection {
    constructor(server) {
        super();
        
        this.server = server;
        this.load();
    }

    load() {
        const modules = this.server.config.modules;
        const logger = this.server.logger;

        for (const key in modules) {
            const module = Object.assign({}, modules[key]);

            this.set(module.dbName, module);
            logger.debug(`[Modules] Loaded "${module.dbName}"`);
        }

        logger.info(`[Modules] ${this.size} registered.`);
    }

}


module.exports = ModuleCollection;