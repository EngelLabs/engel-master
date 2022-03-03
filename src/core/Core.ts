import * as eris from 'eris';
import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import * as store from 'connect-redis';
import * as hbs from 'express-handlebars';
import * as session from 'express-session';
import * as superagent from 'superagent';
import * as core from '@engel/core';
import baseConfig from './utils/baseConfig';
import Renderer from './helpers/Renderer';
import Responses from './helpers/Responses';
import Requests from './helpers/Requests';
import ModuleCollection from './collections/ModuleCollection';
import CommandCollection from './collections/CommandCollection';
import ControllerCollection from './collections/ControllerCollection';

const Store = store(session);

export default class Core extends core.Core {
        public baseConfig = baseConfig;
        public renderer: Renderer;
        public responses: Responses;
        public requests: Requests;
        public modules: ModuleCollection;
        public commands: CommandCollection;
        public controllers: ControllerCollection;
        public app: express.Express;
        private _server?: http.HTTPServer;


        apiRequest(token, path) {
                return superagent
                        .get('https://discord.com/api/v9' + path)
                        .set('Accept', 'application/json')
                        .set('Authorization', token)
                        .set('User-Agent', baseConfig.name)
                        .then(resp => resp.body);
        }

        async fetchUserData(req) {
                const token = req.session.token,
                        config = this.config;

                if (config.apiToken && req.headers.authorization === config.apiToken) {
                        req.session.user = await this.apiRequest(token, '/users/@me');

                        return;
                }

                const [user, allGuilds] = await Promise.all([
                        this.apiRequest(token, '/users/@me'),
                        this.apiRequest(token, '/users/@me/guilds')
                ]);

                const guilds = allGuilds.filter(g => {
                        return g.owner ||
                                (!!(g.permissions & eris.Constants.Permissions.manageGuild.toString())) ||
                                (!!(g.permissions & eris.Constants.Permissions.administrator.toString()));
                });

                const isAdmin = config.users.developers.includes(user.id);

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

        public setup() {
                this.renderer = new Renderer(this);
                this.responses = new Responses(this);
                this.requests = new Requests(this);

                this.modules = new ModuleCollection(this);
                this.commands = new CommandCollection(this);
                this.controllers = new ControllerCollection(this);

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

                this._server = http
                        .createServer(app)
                        .listen(baseConfig.site.port, () => {
                                this.log(`Listening for connections on port ${baseConfig.site.port}.`, 'info');
                        });

                process
                        .on('SIGTERM', () => {
                                this.log('Connection closed.', 'info');

                                if (this._server) {
                                        this._server.close();
                                }
                        })
                        .on('unhandledRejection', reason => {
                                this.log(reason, 'error');
                        });
        }
}
