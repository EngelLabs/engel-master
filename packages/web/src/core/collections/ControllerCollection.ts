import * as fs from 'fs';
import * as path from 'path';
import * as types from '@engel/types';
import Core from '../Core';

const controllersPath = path.join(__dirname, '../../controllers');


export default class ControllerCollection extends Map {
        private _core: Core;
        // TODO: Type this
        private _middlewares: any;
        private _routes: any;

        public constructor(core: Core) {
                super();

                this._core = core;

                this.load();
        }

        public load() {
                const app = this._core.app;

                this._middlewares = [];
                this._routes = [];

                this._loadControllers(controllersPath);

                this._middlewares.sort((a, b) => {
                        return a.uri.length - b.uri.length
                });

                for (const { uri, handler } of this._middlewares) {
                        app.use(uri, handler);

                        this._log(`middleware(${uri || '*'})`);
                }

                for (const { method, uri, handler } of this._routes) {
                        app[method](uri, handler);

                        this._log(`${method}(${uri})`);
                }

                this._log(`[Controllers] ${this.size} registered.`, 'info');
        }

        private _log(message: any, level?: types.LogLevels) {
                this._core.log(message, level, 'Controllers');
        }

        private _loadControllers(controllerPath) {
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
                                dirs = fs.readdirSync(controllerPath);
                        } catch (err) {
                                if (err && ['ENOENT', 'ENOTDIR'].includes(err.code)) {
                                        return;
                                }

                                throw err;
                        }

                        for (const dir of dirs) {
                                this._loadControllers(controllerPath + '/' + dir);
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
                                handler = handler.bind(null, this._core);

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
