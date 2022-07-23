import type * as express from 'express';
import type App from '../../core/structures/App';

export = function (app: App, req: express.Request, res: express.Response) {
        req.session.destroy(err => err && app.logger.get('/logout.get').error(err));

        return res.redirect('/');
}
