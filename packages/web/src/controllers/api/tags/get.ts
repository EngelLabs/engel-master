import type * as express from 'express';
import type Core from '../../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response) {
        const filter = { guild: req.params.id };

        const tags = await core.models.Tag
                .find(filter)
                .lean()
                .exec();

        return core.responses[200](res, tags);
}
