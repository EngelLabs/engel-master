import type * as express from 'express';
import type App from './App';

interface RouteHandler {
        (app: App, req: express.Request, res: express.Response): any
}

interface RouteMiddleware {
        (app: App, req: express.Request, res: express.Response, next: express.NextFunction): any
}

export default class Controller {
        public uri: string | string[];
        public methods: Record<string, RouteHandler | RouteMiddleware> = Object.create(null);

        public constructor(uri: string | string[]) {
                this.uri = uri;
        }

        public use(fn: RouteMiddleware): this {
                this.methods.use = fn;
                return this;
        }

        public get(fn: RouteHandler): this {
                this.methods.get = fn;
                return this;
        }

        public post(fn: RouteHandler): this {
                this.methods.post = fn;
                return this;
        }

        public put(fn: RouteHandler): this {
                this.methods.put = fn;
                return this;
        }

        public delete(fn: RouteHandler): this {
                this.methods.delete = fn;
                return this;
        }

        public patch(fn: RouteHandler): this {
                this.methods.patch = fn;
                return this;
        }

        public options(fn: RouteHandler): this {
                this.methods.options = fn;
                return this;
        }

        public head(fn: RouteHandler): this {
                this.methods.head = fn;
                return this;
        }
}
