"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
class ModuleCollection extends core.Collection {
    _core;
    constructor(core) {
        super();
        this._core = core;
        this.load();
    }
    load() {
        const modules = this._core.config.modules;
        for (const key in modules) {
            const module = Object.assign({}, modules[key]);
            this.set(module.dbName, module);
            this._log(`Loaded "${module.dbName}"`);
        }
        this._log(`${this.size} registered.`, 'info');
    }
    _log(message, level) {
        this._core.log(message, level, 'Modules');
    }
}
exports.default = ModuleCollection;
//# sourceMappingURL=ModuleCollection.js.map