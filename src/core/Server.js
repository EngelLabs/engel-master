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
const database = require('./database');
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

    get config() {
        return this._config;
    }

    set config(config) {
        if (!config) throw new Error(`Configuration not found for state ${baseConfig.state}`);

        return (this._config = config);
    }

    updateConfig() {
        return this.getConfig()
            .then(config => this.config = config)
            .catch(err => {
                logger.error(err)
                return Promise.reject(err)
            });
    }

    getConfig() {
        return new Promise((resolve, reject) => {
            database.collection('configurations').findOne({
                state: baseConfig.state
            })
                .then(resolve)
                .catch(reject)
        });
    }

    async run(options = {}) {
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

        try {
            this.config = await this.getConfig();
        } catch (err) {
            logger.error('Something went wrong.');
            console.error(err);

            process.exit(1);
        }

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
    }

    registerController(controller) {
        const middlewares = [];
        const routes = [];
        // we have to load the route middleware before the route handlers

        const sort = (uri, method, handler) => {
            if (uri === 'use') {
                middlewares.push({ method, handler });
            } else {
                routes.push({ uri, method, handler });
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

            for (const { uri, handler } of middlewares) {
                this.app.use(uri, handler);
                logger.debug(`[Server] middleware(${uri}, ${handler})`);
            }

            for (const { method, uri, handler } of routes) {
                this.app[method](uri, handler);
                logger.debug(`[Server] ${method}(${uri}, ${handler})`);
            }
        }
    }
}


module.exports = Server;