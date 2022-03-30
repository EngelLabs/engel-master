import type * as express from 'express';
import type * as types from '@engel/types';
import type App from '../../../core/structures/App';

const fields = ['name', 'content'];

export = async function (app: App, req: express.Request, res: express.Response) {
        for (const key of fields) {
                if (!Object.prototype.hasOwnProperty.call(req.body, key)) {
                        return app.responses[400](res, 30001, `Field "${key}" is missing`);
                }

                const val = req.body[key];

                if (typeof val !== 'string' || !val.trim().length) {
                        return app.responses[400](res, 30001, `Field "${key}" is invalid`);
                }
        }

        const update = <types.Tag>{};

        update.editedAt = Date.now();
        update.content = (<string>req.body.content);

        const filter = {
                guild: req.params.id,
                name: req.body.name
        };

        if (req.session.isAdmin) {
                if (typeof req.body.newGuild === 'string') update.guild = req.body.newGuild;
                if (typeof req.body.newName === 'string') update.name = req.body.newName;
                if (typeof req.body.newAuthor === 'string') update.author = req.body.newAuthor;

                if (update.content === null) {
                        delete update.content;
                }
        }

        const result = await app.models.Tag
                .findOneAndUpdate(filter, { $set: update }, { new: true })
                .lean()
                .exec();

        if (!result) {
                return app.responses[404](res, 0, 'Unknown tag');
        }

        return app.responses[200](res, result);
}
