import type * as express from 'express';
import type Core from '../../core/Core';

export = function (core: Core, req: express.Request, res: express.Response) {
        return core.renderer.index(req, res);
}
