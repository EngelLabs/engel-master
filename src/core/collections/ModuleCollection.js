const fs = require('fs');
const path = require('path');
const reload = require('require-reload')(require);
const Collection = require('../structures/Collection');
const logger = require('../utils/logger');

const modulesPath = path.resolve('src/modules');


class ModuleCollection extends Collection {
        constructor(bot) {
                super();

                this.bot = bot;
                this._commands = bot.commands;
        }

        register() {
                this.bot.config.modules = {};

                [...this.unique()]
                        .map(m => m.globalConfig)
                        .forEach(m => {
                                if (!m) return;

                                this.bot.config.modules[m.dbName] = m;
                        });

                return new Promise((resolve, reject) => {
                        this.bot.models.Config.updateOne({ state: this.bot.state }, { $set: { modules: this.bot.config.modules } })
                                .exec()
                                .then(resolve)
                                .catch(reject);
                });
        }

        loadSingle(moduleName) {
                if (this.get(moduleName)) return false;

                let module;

                try {
                        module = new (reload(modulesPath + '/' + moduleName));

                        if (module.disabled) {
                                logger.debug(`[Modules] Skipping disabled module "${module.name}".`);

                                return false;
                        }

                        module.inject(this.bot);

                        this.add(module);

                        logger.debug(`[Modules] Loaded "${module.name}".`)

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
                        logger.info(`[Commands] ${this._commands.unique().size} registered.`);
                        logger.info(`[Commands] ${this._commands.all().length} total registered.`);
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