const fs = require('fs');
const path = require('path');
const Collection = require('../structures/Collection');

const controllersPath = path.resolve('src/controllers');


class ControllerCollection extends Collection {
    constructor(server) {
        super();

        this.server = server;
        this.load();
    }

    load() {
        const app = this.server.app;
        const logger = this.server.logger;
        const middlewares = [];
        const routes = [];

        const sort = (uri, method, handler) => {
            if (method === 'use') {
                middlewares.push({ uri, handler });
            } else {
                routes.push({ uri, method, handler });
            }
        }

        const files = fs.readdirSync(controllersPath);

        for (const file of files) {
            try {
                const Controller = require(controllersPath + '/' + file);
                const controller = new Controller;

                for (const route of controller) {
                    const uri = route.uri;
        
                    delete route.uri;
        
                    for (const [method, handler] of Object.entries(route)) {
                        if (uri instanceof Array) {
                            for (const _uri of uri) {
                                sort(_uri, method, handler);
                            }
                        } else {
                            sort(uri, method, handler);
                        }
                    }
                }

                this.set(Controller.name, controller);
            } catch (err) {
                logger.error('[Controllers] Something went wrong.');
                console.error(err);
            }
        }

        for (const { uri, handler } of middlewares) {
            if (uri && uri.length) {
                app.use(uri, handler);
            } else {
                app.use(handler);
            }

            logger.debug(`[Controllers] middleware(${uri || '*'}, ${handler.name})`);
        }

        for (const { method, uri, handler } of routes) {
            app[method](uri, handler);

            logger.debug(`[Controllers] ${method}(${uri}, ${handler.name})`);
        }

        logger.info(`[Controllers] ${this.size} registered.`);
    }
}


module.exports = ControllerCollection;