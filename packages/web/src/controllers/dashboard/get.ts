import type * as express from 'express';
import type Core from '../../core/Core';

export = function (core: Core, req: express.Request, res: express.Response) {
        if (!req.session.user) {
                return res.redirect('/login');
        }

        return core.renderer.dashboard(req, res);
}
