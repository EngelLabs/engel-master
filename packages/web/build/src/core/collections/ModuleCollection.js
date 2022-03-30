"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core = require("@engel/core");
class ModuleCollection extends core.Collection {
    _app;
    constructor(app) {
        super();
        this._app = app;
        this.load();
    }
    load() {
        const modules = this._app.config.modules;
        for (const key in modules) {
            const module = Object.assign({}, modules[key]);
            this.set(module.dbName, module);
            this._log(`Loaded "${module.dbName}"`);
        }
        this._log(`${this.size} registered.`);
    }
    _log(message, level) {
        this._app.log(message, level, 'Modules');
    }
}
exports.default = ModuleCollection;
//# sourceMappingURL=ModuleCollection.js.map