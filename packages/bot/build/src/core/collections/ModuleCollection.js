"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const core = require("@engel/core");
const reload = require('require-reload')(require);
const modulesPath = path.join(__dirname, '../../modules');
class ModuleCollection extends core.Collection {
    _app;
    _commands;
    constructor(app) {
        super();
        this._app = app;
        this._commands = app.commands;
    }
    _log(message, level, prefix = 'Modules') {
        this._app.log(message, level, prefix);
    }
    register() {
        this._app.config.modules = {};
        [...this.unique()]
            .map(m => m.globalConfig)
            .forEach(m => {
            if (!m)
                return;
            this._app.config.modules[m.dbName] = m;
        });
        return new Promise((resolve, reject) => {
            this._app.models.Config.updateOne({ state: this._app.baseConfig.client.state }, { $set: { modules: this._app.config.modules } })
                .exec()
                .then(() => resolve())
                .catch(reject);
        });
    }
    help(moduleName, prefix = '?', includeHidden = false, verbose = true) {
        const module = this.get(moduleName);
        if (!module || ((module.private || module.internal || module.disabled) && !includeHidden))
            return;
        const embed = {
            title: `Module "${module.name}" info`,
            description: '',
            color: this._app.config.colours.info
        };
        if (module.info) {
            embed.description += `**Info:** ${module.info}\n `;
        }
        if (module.commands) {
            const commands = module.commands
                .filter(cmd => !(cmd.hidden && !includeHidden));
            const msg = commands
                .map(cmd => `\t**${cmd.name}**: ${cmd.info || 'No info provided'}`)
                .join('\n');
            if (msg?.length) {
                embed.description += `\n**Commands [${commands.length}]:**\n${msg}`;
            }
        }
        if (verbose) {
            embed.footer = embed.footer || { text: '' };
            embed.footer.text += `\nConfused? Check out "${prefix}help bot"`;
        }
        return embed;
    }
    async loadSingle(moduleName) {
        if (this.get(moduleName))
            return false;
        let module;
        try {
            const Module = (reload(modulesPath + '/' + moduleName)).default;
            module = new Module();
            return this._loadModule(module);
        }
        catch (err) {
            if (module) {
                module.eject(this._app);
            }
            throw err;
        }
    }
    unloadSingle(moduleName) {
        const module = this.get(moduleName);
        if (!module)
            return false;
        module.eject(this._app);
        this.remove(module);
        return true;
    }
    reloadSingle(moduleName) {
        const module = this.get(moduleName);
        if (!module)
            return false;
        this.unloadSingle(module.name);
        try {
            this.loadSingle(module.name);
        }
        catch (err) {
            const _ModuleConstructor = module.constructor;
            this._loadModule(new _ModuleConstructor());
            throw err;
        }
        return true;
    }
    async _loadModule(module) {
        if (module.disabled) {
            this._log(`Skipping disabled module "${module.name}".`);
            return false;
        }
        await module.inject(this._app);
        this.add(module);
        this._log(`Loaded "${module.name}".`);
        return true;
    }
    async load(moduleNames) {
        moduleNames = moduleNames?.length
            ? moduleNames
            : (await this._app.utils.readdir(modulesPath))
                .map(m => m.endsWith('.js') ? m.slice(0, -3) : m);
        let ret = 0;
        const initial = this.size === 0;
        for (const moduleName of moduleNames) {
            if (await this.loadSingle(moduleName))
                ret += 1;
        }
        if (initial) {
            this._log(`${this.unique().size} registered.`);
            this._log(`${this._commands.unique().size} registered.`, 'debug', 'Commands');
            this._log(`${this._commands.all().length} total registered.`, 'debug', 'Commands');
        }
        return ret;
    }
    unload(moduleNames = []) {
        moduleNames = moduleNames?.length
            ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
            : [...this.unique()].map(m => m.name);
        let ret = 0;
        for (const moduleName of moduleNames) {
            if (this.unloadSingle(moduleName))
                ret += 1;
        }
        return ret;
    }
    reload(moduleNames = []) {
        moduleNames = moduleNames?.length
            ? moduleNames.map(m => m.endsWith('.js') ? m.slice(0, -3) : m)
            : [...this.unique()].map(m => m.name);
        let ret = 0;
        for (const moduleName of moduleNames) {
            if (this.reloadSingle(moduleName))
                ret += 1;
        }
        return ret;
    }
}
exports.default = ModuleCollection;
//# sourceMappingURL=ModuleCollection.js.map