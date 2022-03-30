import type * as express from 'express';
import type App from '../../core/structures/App';

export = function (app: App, req: express.Request, res: express.Response) {
        return app.renderer.index(req, res);
}
