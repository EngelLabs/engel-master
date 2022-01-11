const express = require('express');
const hbs = require('express-handlebars');
const session = require('express-session');
const Store = require('connect-redis')(session);
const http = require('http');
const path = require('path');
const logger = require('./utils/logger');
const baseConfig = require('./baseConfig');
const Eris = require('./clients/Eris');
const Redis = require('./clients/Redis');
const MongoDB = require('./clients/MongoDB');
const ModuleCollection = require('./collections/ModuleCollection');
const CommandCollection = require('./collections/CommandCollection');
const ControllerCollection = require('./collections/ControllerCollection');


class Server {
    constructor() {
        Server.instance = this;
    }

    get logger() {
        return logger;
    }

    get baseConfig() {
        return baseConfig;
    }

    get state() {
        return baseConfig.client.state;
    }

    async updateConfig() {
        try {
            await this.getConfig()
                .then(config => {
                    if (!config) {
                        logger.error(`Configuration not found for state ${baseConfig.state}`);

                        return;
                    }

                    return this.config = config;
                })
        } catch (err) {
            logger.error(err);

            return Promise.reject(err);
        }
    }

    getConfig() {
        return this.database.collection('configurations').findOne({ state: this.state });
    }

    async start() {
        try {
            logger.info(`[Server] Starting ${baseConfig.name} (env=${baseConfig.env} s=${this.state}, v=${baseConfig.version}).`);

            this.eris = new Eris(this);
            this.redis = new Redis(this);

            const app = this.app = express();

            app.set('view engine', 'hbs');
            app.engine('hbs', hbs.engine({
                extname: 'hbs',
                layoutsDir: path.resolve('views/layouts'),
                partialsDir: path.resolve('views/partials'),
                defaultLayout: 'main',
            }));

            app.use(express.static('public'));
            app.use(express.json());
            app.use(session({
                name: 'timbot.sid',
                secret: baseConfig.site.secret,
                resave: false,
                saveUninitialized: true,
                store: new Store({
                    client: this.redis,
                    ttl: 7 * 24 * 60 * 60,
                }),
                cookie: {
                    expires: 7 * 24 * 60 * 60 * 1000, // 7d, the time it takes for Discord access token to expire
                },
            }));

            const mongoClient = new MongoDB(this);

            await mongoClient.connect();

            this.database = mongoClient.db()

            this.config = await this.getConfig();

            this.modules = new ModuleCollection(this);
            this.commands = new CommandCollection(this);
            this.controllers = new ControllerCollection(this);

            const httpServer = http
                .createServer(app)
                .listen(baseConfig.site.port, () => {
                    logger.info(`[Server] Listening for connections on port ${baseConfig.site.port}.`);
                });

            process
                .on('SIGTERM', () => {
                    logger.info('[Server] Connection closed.');
                    httpServer.close();
                })
                .on('unhandledRejection', reason => {
                    logger.error('Unhandled Promise rejection');
                    console.error(reason);
                });

        } catch (err) {
            logger.error('[Server] Something went wrong.');
            console.error(err);

            process.exit(1);
        }
    }
}


module.exports = Server;