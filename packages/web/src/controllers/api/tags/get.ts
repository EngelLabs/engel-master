import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        const filter = { guild: req.params.id };

        const tags = await app.models.Tag
                .find(filter)
                .lean()
                .exec();

        return app.responses[200](res, tags);
}
