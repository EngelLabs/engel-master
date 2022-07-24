import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        const guild = await app.mongo.guilds.findOne({ id: req.params.id });

        return guild
                ? app.responses[200](res, guild)
                : app.responses[404](res, 10001);
}
