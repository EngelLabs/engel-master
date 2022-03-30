import type * as express from 'express';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        const filter: any = { guild: req.params.id, author: req.session.user.id };

        if (typeof req.body.author === 'string') {
                filter.author = req.body.author;
        }

        if (req.body.tags instanceof Array && req.body.tags.length) {
                const tags = (<string[]>req.body.tags).filter(o => typeof o === 'string' && o.length);

                if (!tags.length) {
                        return app.responses[400](res, 30001, 'Invalid tag names');
                }

                filter.name = { $in: tags };
        }

        await app.models.Tag.deleteMany(filter);

        return app.responses[204](res);
}
