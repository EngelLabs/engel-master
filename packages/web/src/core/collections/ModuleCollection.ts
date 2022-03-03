import * as core from '@engel/core';
import * as types from '@engel/types';
import Core from '../Core';

export default class ModuleCollection extends core.Collection {
        private _core: Core;

        constructor(core: Core) {
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

        private _log(message: any, level?: types.LogLevels) {
                this._core.log(message, level, 'Modules');
        }
}
