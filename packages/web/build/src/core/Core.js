"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const path = require("path");
const express = require("express");
const store = require("connect-redis");
const hbs = require("express-handlebars");
const session = require("express-session");
const core = require("@engel/core");
const baseConfig_1 = require("./utils/baseConfig");
const Renderer_1 = require("./helpers/Renderer");
const Responses_1 = require("./helpers/Responses");
const Requests_1 = require("./helpers/Requests");
const ModuleCollection_1 = require("./collections/ModuleCollection");
const CommandCollection_1 = require("./collections/CommandCollection");
const ControllerCollection_1 = require("./collections/ControllerCollection");
const Store = store(session);
class Core extends core.Core {
    baseConfig = baseConfig_1.default;
    renderer;
    responses;
    requests;
    modules;
    commands;
    controllers;
    app;
    _server;
    async setup() {
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
            name: 'engel.sid',
            secret: baseConfig_1.default.site.secret,
            resave: false,
            saveUninitialized: true,
            store: new Store({
                client: this.redis,
                ttl: 7 * 24 * 60 * 60
            }),
            cookie: {
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        }));
        this.renderer = new Renderer_1.default(this);
        this.responses = new Responses_1.default(this);
        this.requests = new Requests_1.default(this);
        this.modules = new ModuleCollection_1.default(this);
        this.commands = new CommandCollection_1.default(this);
        this.controllers = new ControllerCollection_1.default(this);
        await this.controllers.load();
        this._server = http
            .createServer(app)
            .listen(baseConfig_1.default.site.port, () => {
            this.log(`Listening for connections on port ${baseConfig_1.default.site.port}.`, 'info');
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
exports.default = Core;
//# sourceMappingURL=Core.js.map