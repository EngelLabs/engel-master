import type * as express from 'express';
import type App from '../../core/structures/App';

export = function (app: App, req: express.Request, res: express.Response) {
        if (!req.session.user) {
                return res.redirect('/login');
        }

        return app.renderer.dashboard(req, res);
}
