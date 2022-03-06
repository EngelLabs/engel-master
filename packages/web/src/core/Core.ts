import * as http from 'http';
import * as path from 'path';
import * as express from 'express';
import * as store from 'connect-redis';
import * as hbs from 'express-handlebars';
import * as session from 'express-session';
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
        private _server?: http.Server;

        public setup(): Promise<void> {
                const app = this.app = express();

                app.set('view engine', 'hbs');
                app.engine('hbs', hbs.engine({
                        extname: 'hbs',
                        layoutsDir: path.resolve('views/layouts'),
                        partialsDir: path.resolve('views/partials'),
                        defaultLayout: 'main'
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
                                ttl: 7 * 24 * 60 * 60
                        }),
                        cookie: {
                                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d, the time it takes for Discord access token to expire
                        }
                }));

                this.renderer = new Renderer(this);
                this.responses = new Responses(this);
                this.requests = new Requests(this);

                this.modules = new ModuleCollection(this);
                this.commands = new CommandCollection(this);
                this.controllers = new ControllerCollection(this);

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

                return Promise.resolve();
        }
}
