const Collection = require('../structures/Collection');


class ModuleCollection extends Collection {
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

        for (const moduleName in config.modules) {
            const module = Object.assign({}, config.modules[moduleName]);
            module.name = moduleName.slice(0, 1).toUpperCase() + moduleName.slice(1);
            module.dbName = moduleName;
            this.add(module);
        }

        this.server.logger.info(`[Modules] ${this.unique().size} registered.`);
    }

    add(module) {
        this.set(module.name, module);

        if (module.aliases) {
            for (const alias of module.aliases) {
                this.set(alias, module);
            }
        }
    }
}


module.exports = ModuleCollection;