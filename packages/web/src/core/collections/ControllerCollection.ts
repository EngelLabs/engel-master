import * as path from 'path';
import * as core from '@engel/core';
import type App from '../structures/App';

const controllersPath = path.join(__dirname, '../../controllers');

export default class ControllerCollection extends Map {
        private _app: App;
        private _logger: core.Logger;
        // TODO: Type this
        private _middlewares: any;
        private _routes: any;

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

                this._middlewares.sort((a: { uri: string }, b: { uri: string }) => {
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

                this._logger.debug(`${this.size} registered.`);
        }

        private async _loadControllers(controllerPath: string) {
                try {
                        var controller = require(controllerPath);
                } catch (err) {
                        let skip = false;

                        if (err.code && err.code === 'MODULE_NOT_FOUND') {
                                skip = true;
                        }

                        if (!skip) {
                                throw err;
                        }
                }

                if (!controller) {
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

                        return;
                }

                if (!(controller instanceof Array)) {
                        controller = [controller];
                }

                for (const route of controller) {
                        let uriArray = route.uri;

                        if (!(uriArray instanceof Array)) {
                                uriArray = [uriArray];
                        }

                        delete route.uri;

                        for (let [method, handler] of Object.entries(route)) {
                                handler = (<Function>handler).bind(null, this._app);

                                for (const uri of uriArray) {
                                        if (method === 'use') {
                                                this._middlewares.push({ uri, handler });
                                        } else {
                                                this._routes.push({ uri, method, handler });
                                        }
                                }
                        }

                        this.set(uriArray, route);
                }
        }
}
