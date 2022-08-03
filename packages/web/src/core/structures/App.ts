import * as core from '@engel/core';
import type * as express from 'express';
import Server from './Server';
import Renderer from '../helpers/Renderer';
import Requests from '../helpers/Requests';
import ControllerCollection from '../collections/ControllerCollection';
import createStaticConfig from '../utils/createStaticConfig';

export default class App extends core.App {
        public staticConfig = createStaticConfig();
        public renderer: Renderer;
        public requests: Requests;
        public controllers: ControllerCollection;
        public server: Server;

        public get express(): express.Express {
                return this.server.express;
        }

        public async setup(): Promise<void> {
                this.server = new Server(this);

                this.renderer = new Renderer(this);
                this.requests = new Requests(this);

                this.controllers = new ControllerCollection(this);

                await this.controllers.load();

                this.server.start();

                return Promise.resolve();
        }
}
