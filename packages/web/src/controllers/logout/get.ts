import type * as express from 'express';
import type Core from '../../core/Core';

export = function (core: Core, req: express.Request, res: express.Response) {
        req.session.destroy(err => err && core.log(err, 'error', '/logout.get'));

        return res.redirect('/');
}
