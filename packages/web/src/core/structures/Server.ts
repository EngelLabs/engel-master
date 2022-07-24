import * as path from 'path';
import * as http from 'http';
import * as express from 'express';
import * as hbs from 'express-handlebars';
import * as session from 'express-session';
import * as store from 'connect-redis';
import type * as core from '@engel/core';
import baseConfig from '../utils/baseConfig';
import App from './App';

const Store = store(session);

function createResponseHandler(status: number, defaultData?: any) {
        return function (this: express.Response, data?: any) {
                data = data === undefined ? defaultData : data;

                if (typeof data === 'string') {
                        this.set('Content-Type', 'text/plain');
                } else if (data !== undefined) {
                        if (data instanceof Array) {
                                data = data.map(o => {
                                        delete o.__v;
                                        delete o._id;

                                        return o;
                                });
                        } else {
                                delete data.__v;
                                delete data._id;
                        }

                        data = { data };

                        this.set('Content-Type', 'application/json');
                }

                this.status(status);

                return data === undefined
                        ? this.end()
                        : this.send(data);
        };
}

function createErrorResponseHandler(status: number, defaultMessage: string) {
        return function (this: express.Response, code?: number, message?: any) {
                message = message === undefined ? `${status}: ${defaultMessage}` : message;

                const data: any = { message };

                data._debug = `https://http.cat/${status}`;
                data._code = code !== undefined ? code : null;

                return this.status(status).send(data);
        };
}
export default class Server {
        public express: express.Express;
        private _logger: core.Logger;
        private _server: http.Server;

        public constructor(app: App) {
                this._logger = app.logger.get('Server');

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

                this.express.response[200] = createResponseHandler(200, 'OK');
                this.express.response[201] = createResponseHandler(201, 'OK');
                this.express.response[204] = createResponseHandler(204);
                this.express.response[400] = createErrorResponseHandler(400, 'Bad Request');
                this.express.response[401] = createErrorResponseHandler(401, 'Unauthorized');
                this.express.response[403] = createErrorResponseHandler(403, 'Forbidden');
                this.express.response[404] = createErrorResponseHandler(404, 'Not Found');
                this.express.response[405] = createErrorResponseHandler(405, 'Method Not Allowed');
                this.express.response[500] = createErrorResponseHandler(500, 'Internal Server Error');
        }

        public start() {
                this._server = http.createServer(this.express)
                        .listen(baseConfig.site.port, () => {
                                this._logger.info(`Listening for connections on port ${baseConfig.site.port}.`);
                        });

                process
                        .on('SIGTERM', () => {
                                this._logger.debug('Connection closed.');

                                if (this._server) {
                                        this._server.close();
                                }
                        })
                        .on('unhandledRejection', reason => {
                                this._logger.error(reason);
                        });
        }
}
