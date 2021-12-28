'use strict';

const express = require('express');
const hbs = require('express-handlebars');
const session = require('express-session');
const Store = require('connect-redis')(session);
const path = require('path');
const glob = require('glob');
const Eris = require('eris');
const baseConfig = require('./baseConfig');
const logger = require('./logger');
const redis = require('./redis')
const mongoClient = require('./database');
const database = mongoClient.db();
const ModuleCollection = require('../collections/ModuleCollection');
const CommandCollection = require('../collections/CommandCollection');

const basePath = path.resolve(path.join(__dirname, '..', '..'));
const controllersPath = path.join(basePath, 'src/controllers');


class Server {
    constructor() {
        Server.instance = this;
    }

    get database() {
        return database;
    }

    get redis() {
        return redis;
    }

    get logger() {
        return logger;
    }

    get baseConfig() {
        return baseConfig;
    }

    updateConfig() {
        return this.getConfig()
            .then(config => {
                if (!config) {
                    logger.error(`Configuration not found for state ${baseConfig.state}`);

                    return;
                }

                return this.config = config;
            })
            .catch(err => {
                logger.error(err);

                return Promise.reject(err);
            });
    }

    getConfig() {
        return new Promise((resolve, reject) => {
            database.collection('configurations').findOne({
                state: baseConfig.state
            })
                .then(resolve)
                .catch(reject);
        });
    }

    async run(options = {}) {
        try {
            logger.info(`[Server] Starting ${baseConfig.name} (${baseConfig.state}, v${baseConfig.version}).`);

            options = Object.assign(options, {
                eris: {
                    restMode: true,
                },
                session: {
                    name: 'timbot.sid',
                    secret: baseConfig.secret,
                    resave: false,
                    saveUninitialized: true,
                    store: new Store({
                        client: redis,
                        ttl: 7 * 24 * 60 * 60,
                    }),
                    cookie: {
                        expires: 7 * 24 * 60 * 60 * 1000, // 7d, the time it takes for Discord access token expires
                    },
                },
                handlebars: {
                    extname: 'hbs',
                    layoutsDir: basePath + '/views/layouts',
                    defaultLayout: 'main',
                },
            });

            await mongoClient.connect();
            this.config = await this.getConfig();

            process.on('unhandledRejection', (reason, promise) => {
                console.error(`Unhandled Promise rejection at ${promise}. Reason: ${reason}`);
            });

            this.eris = new Eris('Bot ' + baseConfig.client.token, options.eris);

            const me = await this.eris.getSelf();

            if (me.id !== baseConfig.client.id) {
                logger.error(`Invalid client id provided.`);

                process.exit(1);
            }

            this.modules = new ModuleCollection(this);
            this.commands = new CommandCollection(this);

            this.modules.load();
            this.commands.load();

            const app = this.app = express();

            app.set('view engine', 'hbs');
            app.engine('hbs', hbs.engine(options.handlebars));

            app.use(express.static('public'));
            app.use(express.json());
            app.use(session(options.session));

            const files = glob.sync(controllersPath + '/**');
            const controllers = [];

            this._middlewares = [];
            this._routes = [];

            for (const file of files) {
                try {
                    var Controller = require(file);
                } catch (err) {
                    continue;
                }

                const controller = new Controller();

                this.registerController(controller);
                controllers.push(controller);
            }

            for (const { uri, handler } of this._middlewares) {
                if (uri && uri.length) {
                    this.app.use(uri, handler);
                } else {
                    this.app.use(handler);
                }
    
                logger.debug(`[Server] middleware(${uri || '*'}, ${handler.name})`);
            }
    
            for (const { method, uri, handler } of this._routes) {
                this.app[method](uri, handler);
    
                logger.debug(`[Server] ${method}(${uri}, ${handler})`);
            }

            delete this._middlewares;
            delete this._routes;

            logger.info(`[Controllers] ${controllers.length} registered.`);

            // app.use((req, res, next, err) => {

            // });

            const httpServer = app.listen(baseConfig.port, () => {
                logger.info(`[Server] Listening for connections on port ${baseConfig.port}.`);
            });

            process.on('SIGTERM', () => {
                logger.info(`[Server] Connection closed.`);
                httpServer.close()
            });
        } catch (err) {
            logger.error('[Server] Something went wrong.');
            console.error(err);

            process.exit(1);
        }
    }

    registerController(controller) {
        const sort = (uri, method, handler) => {
            if (method === 'use') {
                this._middlewares.push({ uri, handler });
            } else {
                this._routes.push({ uri, method, handler });
            }
        }

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
    }
}


module.exports = Server;