import * as core from '@engel/core';
import type * as types from '@engel/types';
import type App from '../structures/App';

export default class ModuleCollection extends core.Collection<types.GlobalModuleConfig> {
        private _app: App;

        public constructor(app: App) {
                super();

                this._app = app;

                this.load();
        }

        public load() {
                const modules = this._app.config.modules;

                for (const key in modules) {
                        const module: any = Object.assign({}, modules[key]);

                        this.set(module.dbName, module);

                        this._log(`Loaded "${module.dbName}"`);
                }

                this._log(`${this.size} registered.`);
        }

        private _log(message: any, level?: types.LogLevels) {
                this._app.log(message, level, 'Modules');
        }
}
