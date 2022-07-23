import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import * as hbs from 'express-handlebars';
import * as session from 'express-session';
import * as store from 'connect-redis';
import type * as types from '@engel/types';
import baseConfig from '../utils/baseConfig';
import App from './App';

const Store = store(session);

export default class Server {
        public express: express.Express;
        private _app: App;
        private _server: http.Server;

        public constructor(app: App) {
                this._app = app;
                this.express = express();

                // Setup HBS engine
                this.express.set('view engine', 'hbs');
                this.express.engine('hbs', hbs.engine({
                        extname: 'hbs',
                        layoutsDir: path.resolve('views/layouts'),
                        partialsDir: path.resolve('views/partials'),
                        defaultLayout: 'main'
                }));

                // Setup middleware
                this.express.use(express.static('public'));
                this.express.use(express.json());
                this.express.use(session({
                        name: 'engel.sid',
                        secret: baseConfig.site.secret,
                        resave: false,
                        saveUninitialized: true,
                        store: new Store({
                                client: app.redis,
                                ttl: 7 * 24 * 60 * 60
                        }),
                        cookie: {
                                maxAge: 7 * 24 * 60 * 60 * 1000 // 7d, the time it takes for Discord access token to expire
                        }
                }));
        }

        public start() {
                this._server = http.createServer(this.express)
                        .listen(baseConfig.site.port, () => {
                                this._log(`Listening for connections on port ${baseConfig.site.port}.`, 'info');
                        });

                process
                        .on('SIGTERM', () => {
                                this._log('Connection closed.');

                                if (this._server) {
                                        this._server.close();
                                }
                        })
                        .on('unhandledRejection', reason => {
                                this._log(reason, 'error');
                        });
        }

        private _log(message: any, level?: types.LogLevels) {
                return this._app.log(message, level, 'Server');
        }
}
