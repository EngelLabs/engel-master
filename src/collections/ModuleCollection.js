const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);
const Collection = require('../structures/Collection');
const Config = require('../models/Config');
const logger = require('../core/logger');

const modulesPath = path.join(__dirname, '..', 'modules');


class ModuleCollection extends Collection {
    constructor(bot) {
        super();

        if (bot) this.bot = bot;
    }

    register(config) {
        let update;

        for (const module of this.unique()) {
            if (module.internal || module.private) continue;

            const moduleName = module.dbName;
            
            if (!update) update = {};

            update['modules.' + moduleName] = config.modules[moduleName] = module.getConfig();
        }

        return new Promise((resolve, reject) => {
            if (update) {
                Config.updateOne({ state: config.state }, { $set: update })
                    .exec()
                    .then(resolve)
                    .catch(reject);
            }

            resolve(false);
        });
    }

    loadSingle(moduleName) {
        if (this.get(moduleName)) return false;

        let module;

        try {
            module = new (reload('../modules/' + moduleName));

            module.inject(this.bot);

            this.add(module); 

            return true;

        } catch (err) {
            if (module) {
                module.eject(this.bot);
            }

            throw err;
        }
    }

    unloadSingle(moduleName) {
        const module = this.get(moduleName);

        if (!module) return false;

        module.eject(this.bot);

        this.remove(module);

        return true;
    }

    reloadSingle(moduleName) {
        if (!this.unloadSingle(moduleName)) return false;
        this.loadSingle(moduleName);
        
        return true;
    }

    load(moduleNames) {
        moduleNames = moduleNames && moduleNames.length
            ? moduleNames
            : fs.readdirSync(modulesPath)
                .map(m => m.endsWith('.js') ? m.slice(0, -3) : m)

        let ret = 0;
        const initial = this.size === 0;

        for (const moduleName of moduleNames) {
            if (this.loadSingle(moduleName)) ret += 1;
        }

        if (initial) {
            logger.info(`[Modules] ${this.unique().size} registered.`);
            
            if (this.bot) {
                this.bot.commands.log();
            }
        }

        return ret;
    }

    unload(moduleNames = []) {
        moduleNames = moduleNames && moduleNames.length
            ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
            : this.unique();

        let ret = 0;

        for (const moduleName of moduleNames) {
            if (this.unloadSingle(moduleName)) ret += 1;
        }

        return ret;
    }

    reload(moduleNames = []) {
        moduleNames = moduleNames && moduleNames.length
            ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
            : [...this.unique()].map(m => m.name);

        let ret = 0;

        for (const moduleName of moduleNames) {
            if (this.reloadSingle(moduleName)) ret += 1;
        }

        return ret;
    }

    add(module) {
        this.set(module.name, module);

        if (module.aliases) {
            for (const alias of module.aliases) {
                this.set(alias, module);
            }
        }
    }

    remove(module) {
        this.delete(module.name);

        if (module.aliases) {
            for (const alias of module.aliases) {
                this.delete(alias);
            }
        }
    }
}


module.exports = ModuleCollection;