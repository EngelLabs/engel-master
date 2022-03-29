"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const controllersPath = path.join(__dirname, '../../controllers');
class ControllerCollection extends Map {
    _core;
    _middlewares;
    _routes;
    constructor(core) {
        super();
        this._core = core;
    }
    async load() {
        const app = this._core.app;
        this._middlewares = [];
        this._routes = [];
        await this._loadControllers(controllersPath);
        this._middlewares.sort((a, b) => {
            return a.uri.length - b.uri.length;
        });
        for (const { uri, handler } of this._middlewares) {
            app.use(uri, handler);
            this._log(`middleware(${uri || '*'})`);
        }
        for (const { method, uri, handler } of this._routes) {
            app[method](uri, handler);
            this._log(`${method}(${uri})`);
        }
        this._log(`${this.size} registered.`, 'info');
    }
    _log(message, level) {
        this._core.log(message, level, 'Controllers');
    }
    async _loadControllers(controllerPath) {
        try {
            var controller = require(controllerPath);
        }
        catch (err) {
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
                dirs = (await this._core.utils.readdir(controllerPath))
                    .filter(f => !f.endsWith('.js.map'));
            }
            catch (err) {
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
                handler = handler.bind(null, this._core);
                for (const uri of uriArray) {
                    if (method === 'use') {
                        this._middlewares.push({ uri, handler });
                    }
                    else {
                        this._routes.push({ uri, method, handler });
                    }
                }
            }
            this.set(uriArray, route);
        }
    }
}
exports.default = ControllerCollection;
//# sourceMappingURL=ControllerCollection.js.map