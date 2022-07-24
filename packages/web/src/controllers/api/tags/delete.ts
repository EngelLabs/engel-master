import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        const filter: any = { guild: req.params.id, author: req.session.user.id };
        const body = req.body;

        if (typeof body.author === 'string') {
                filter.author = body.author;
        }

        if (body.tags instanceof Array && body.tags.length) {
                const tags = (<string[]>body.tags).filter(o => typeof o === 'string' && o.length);

                if (!tags.length) {
                        return res[400](30001, 'Invalid tag names');
                }

                filter.name = { $in: tags };
        }

        await app.mongo.tags.deleteMany(filter);

        return res[204]();
}
