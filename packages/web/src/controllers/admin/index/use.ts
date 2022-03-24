import type * as express from 'express';
import type Core from '../../../core/Core';

export = function (core: Core, req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!req.session.isAdmin) {
                return core.responses[403](res);
        }

        return next();
}
