import type * as express from 'express';
import type App from '../../../core/structures/App';

export = function (app: App, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session.isAdmin) {
                return app.responses[403](res);
        }

        return next();
}
