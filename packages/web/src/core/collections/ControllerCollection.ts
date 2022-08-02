import * as path from 'path';
import type * as core from '@engel/core';
import Controller from '../structures/Controller';
import type App from '../structures/App';

const controllersPath = path.join(__dirname, '../../controllers');

export default class ControllerCollection extends Map {
        private _app: App;
        private _logger: core.Logger;
        private _middlewares?: Array<{ uri: string; handler: (...args: any) => any; }>;
        private _routes?: Array<{ uri: string; method: string; handler: (...args: any) => any; }>;

        public constructor(app: App) {
                super();

                this._app = app;
                this._logger = app.logger.get('Controllers');
        }

        public async load() {
                const app = this._app.express;

                this._middlewares = [];
                this._routes = [];

                await this._loadControllers(controllersPath);

                this._middlewares.sort((a, b) => {
                        return a.uri.length - b.uri.length;
                });

                for (const { uri, handler } of this._middlewares) {
                        app.use(uri, handler);

                        this._logger.debug(`middleware(${uri || '*'})`);
                }

                for (const { method, uri, handler } of this._routes) {
                        app[<keyof typeof app>method](uri, handler);

                        this._logger.debug(`${method}(${uri})`);
                }

                delete this._middlewares;
                delete this._routes;

                this._logger.debug(`${this.size} registered.`);
        }

        private async _loadControllers(controllerPath: string) {
                try {
                        var controller = require(controllerPath).default;
                } catch (err) {
                        let skip = false;

                        if (err.code && err.code === 'MODULE_NOT_FOUND') {
                                skip = true;
                        }

                        if (!skip) {
                                throw err;
                        }
                }

                if (controller) {
                        this._registerController(controller);
                }

                let dirs;

                try {
                        dirs = (await this._app.utils.readdir(controllerPath))
                                .filter(f => !f.endsWith('.js.map'));
                } catch (err) {
                        if (err && ['ENOENT', 'ENOTDIR'].includes(err.code)) {
                                return;
                        }

                        throw err;
                }

                for (const dir of dirs) {
                        await this._loadControllers(controllerPath + '/' + dir);
                }
        }

        private _registerController(controller: Controller) {
                if (!(controller instanceof Controller)) {
                        throw new Error(`Invalid controller: ${controller}`);
                }

                let uriArray = controller.uri;

                if (!(uriArray instanceof Array)) {
                        uriArray = [uriArray];
                }

                for (let [method, handler] of Object.entries(controller.methods)) {
                        for (const uri of uriArray) {
                                handler = handler.bind(null, this._app);

                                if (method === 'use') {
                                        this._middlewares.push({ uri, handler });
                                } else {
                                        this._routes.push({ uri, method, handler });
                                }
                        }
                }

                for (const uri of uriArray) {
                        this.set(uri, controller);
                }
        }
}
