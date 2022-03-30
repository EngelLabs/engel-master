import type * as express from 'express';
import type App from '../../core/structures/App';

export = function (app: App, req: express.Request, res: express.Response) {
        req.session.destroy(err => err && app.log(err, 'error', '/logout.get'));

        return res.redirect('/');
}
