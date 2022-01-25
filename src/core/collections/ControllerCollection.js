const fs = require('fs');
const path = require('path');

const controllersPath = path.resolve('src/controllers');


class ControllerCollection extends Map {
        constructor(server) {
                super();

                this.server = server;
                this.load();
        }

        load() {
                const app = this.server.app;
                const logger = this.server.logger;

                this._middlewares = [];
                this._routes = [];

                this._loadControllers(controllersPath);

                this._middlewares.sort((a, b) => {
                        return a.uri.length - b.uri.length
                });

                for (const { uri, handler } of this._middlewares) {
                        app.use(uri, handler);

                        logger.debug(`[Controllers] middleware(${uri || '*'})`);
                }

                for (const { method, uri, handler } of this._routes) {
                        app[method](uri, handler);

                        logger.debug(`[Controllers] ${method}(${uri})`);
                }

                logger.info(`[Controllers] ${this.size} registered.`);
        }

        _loadControllers(controllerPath) {
                let controller;

                try {
                        controller = require(controllerPath);
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
                                handler = handler.bind(null, this.server);

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


module.exports = ControllerCollection;