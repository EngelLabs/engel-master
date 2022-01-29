const express = require('express');
const hbs = require('express-handlebars');
const session = require('express-session');
const Store = require('connect-redis')(session);
const { Permissions } = require('eris').Constants;
const superagent = require('superagent');
const http = require('http');
const path = require('path');
const logger = require('./utils/logger');
const baseConfig = require('./utils/baseConfig');
const Eris = require('./clients/Eris');
const Redis = require('./clients/Redis');
const MongoDB = require('./clients/MongoDB');
const Renderer = require('./helpers/Renderer')
const responseHandlers = require('./helpers/response');
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

        collection(...args) {
                return this.database.collection(...args);
        }

        log(msg, level = 'debug', prefix) {
                prefix = prefix || this.constructor.name;

                if (level === 'error') {
                        this.logger.error(`[${prefix}] Something went wrong.`);
                        console.error(msg);

                        return;
                }

                return this.logger[level](`[${prefix}] ${msg}`);
        }

        response(status, ...args) {
                return responseHandlers[status](...args);
        }

        apiRequest(token, path) {
                return superagent
                        .get('https://discord.com/api/v9' + path)
                        .set('Accept', 'application/json')
                        .set('Authorization', token)
                        .set('User-Agent', baseConfig.name)
                        .then(resp => resp.body);
        }

        async fetchUserData(req) {
                const token = req.session.token;

                if (this.config.apiToken && req.headers.authorization === this.config.apiToken) {
                        req.session.user = await this.apiRequest(token, '/users/@me');

                        return;
                }

                const [user, allGuilds] = await Promise.all([
                                this.apiRequest(token, '/users/@me'),
                                this.apiRequest(token, '/users/@me/guilds')
                        ]);

                const guilds = allGuilds.filter(g => {
                        return g.owner ||
                                (!!(g.permissions & Permissions.manageGuild.toString())) ||
                                (!!(g.permissions & Permissions.administrator.toString()));
                });

                const isAdmin = this.config.users.developers.includes(user.id);

                Object.assign(req.session, { user, guilds, allGuilds, isAdmin });
        }

        syncLocals(req, res) {
                if (!req.url.includes('api')) {
                        Object.assign(res.locals, {
                                user: JSON.stringify(req.session.user),
                                guilds: JSON.stringify(req.session.guilds),
                                allGuilds: JSON.stringify(req.session.allGuilds),
                                isAdmin: JSON.stringify(req.session.isAdmin),
                        });
                }
        }

        async updateConfig() {
                try {
                        return (this.config = await this.getConfig());
                } catch (err) {
                        logger.error(err);

                        return Promise.reject(err);
                }
        }

        getConfig() {
                return this.database
                        .collection('configurations')
                        .findOne({ state: this.state });
        }

        get config() {
                return this._config;
        }

        set config(config) {
                if (!config) {
                        logger.error(`Configuration not found for state ${this.state}`);

                        process.exit(1);
                }

                if (config.configRefreshInterval !== this._config?.configRefreshInterval) {
                        clearInterval(this._configInterval);

                        this._configInterval = setInterval(this.updateConfig.bind(this), config.configRefreshInterval);
                }

                return (this._config = config);
        }

        async start() {
                try {
                        this.log(`Starting ${baseConfig.name} (env=${baseConfig.env} s=${this.state}, v=${baseConfig.version}).`, 'info');

                        this.eris = new Eris(this);
                        this.redis = new Redis(this);

                        this.renderer = new Renderer(this);

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

                        this.database = mongoClient.db();

                        this.config = await this.getConfig();

                        this.modules = new ModuleCollection(this);
                        this.commands = new CommandCollection(this);
                        this.controllers = new ControllerCollection(this);

                        const httpServer = http
                                .createServer(app)
                                .listen(baseConfig.site.port, () => {
                                        this.log(`Listening for connections on port ${baseConfig.site.port}.`, 'info');
                                });

                        process
                                .on('SIGTERM', () => {
                                        this.log('Connection closed.', 'info');
                                        httpServer.close();
                                })
                                .on('unhandledRejection', reason => {
                                        logger.error('Unhandled Promise rejection');
                                        console.error(reason);
                                });

                } catch (err) {
                        this.log('Something went wrong.');
                        console.error(err);

                        process.exit(1);
                }
        }
}


module.exports = Server;