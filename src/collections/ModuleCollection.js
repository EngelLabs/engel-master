const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);
const Collection = require('../structures/Collection');
const logger = require('../core/logger');

const modulesPath = path.join(__dirname, '..', 'modules');


class ModuleCollection extends Collection {
    constructor(bot) {
        super();

        this.bot = bot;
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
                this.bot.models.Config.updateOne({ state: config.state }, { $set: update })
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

            if (module.disabled) {
                logger.debug(`[Modules] Skipping disabled module "${module.name}".`);

                return false;
            }

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
        const module = this.get(moduleName);

        if (!module) return false;
        this.unloadSingle(module.name);
        this.loadSingle(module.name);

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
}


module.exports = ModuleCollection;