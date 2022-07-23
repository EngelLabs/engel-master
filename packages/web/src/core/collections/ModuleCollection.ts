import * as core from '@engel/core';
import type * as types from '@engel/types';
import type App from '../structures/App';

export default class ModuleCollection extends core.Collection<types.GlobalModuleConfig> {
        private _app: App;
        private _logger: core.Logger;

        public constructor(app: App) {
                super();

                this._app = app;
                this._logger = app.logger.get('Modules');

                this.load();
        }

        public load() {
                const modules = this._app.config.modules;

                for (const key in modules) {
                        const module: any = Object.assign({}, modules[key]);

                        this.set(module.dbName, module);

                        this._logger.debug(`Loaded "${module.dbName}"`);
                }

                this._logger.debug(`${this.size} registered.`);
        }
}
