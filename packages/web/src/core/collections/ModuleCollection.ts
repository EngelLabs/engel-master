import * as core from '@engel/core';
import type * as types from '@engel/types';
import type Core from '../Core';

export default class ModuleCollection extends core.Collection<types.GlobalModuleConfig> {
        private _core: Core;

        public constructor(core: Core) {
                super();

                this._core = core;

                this.load();
        }

        public load() {
                const modules = this._core.config.modules;

                for (const key in modules) {
                        const module: any = Object.assign({}, modules[key]);

                        this.set(module.dbName, module);

                        this._log(`Loaded "${module.dbName}"`);
                }

                this._log(`${this.size} registered.`);
        }

        private _log(message: any, level?: types.LogLevels) {
                this._core.log(message, level, 'Modules');
        }
}
