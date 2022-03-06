import type * as express from 'express';
import type Core from '../../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response) {
        const filter: any = { guild: req.params.id, author: req.session.user.id };

        if (typeof req.body.author === 'string') {
                filter.author = req.body.author;
        }

        if (req.body.tags instanceof Array && req.body.tags.length) {
                const tags = (<string[]>req.body.tags).filter(o => typeof o === 'string' && o.length);

                if (!tags.length) {
                        return core.responses[400](res, 30001, 'Invalid tag names');
                }

                filter.name = { $in: tags };
        }

        await core.models.Tag.deleteMany(filter);

        return core.responses[204](res);
}
