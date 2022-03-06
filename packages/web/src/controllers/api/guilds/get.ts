import type * as express from 'express';
import type Core from '../../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response) {
        const guild = await core.models.Guild
                .findOne({ id: req.params.id })
                .lean()
                .exec();

        return guild
                ? core.responses[200](res, guild)
                : core.responses[404](res, 10001);
}
