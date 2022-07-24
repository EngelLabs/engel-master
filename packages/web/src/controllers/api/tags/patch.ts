import type * as express from 'express';
import type * as types from '@engel/types';
import type App from '../../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response) {
        const body = req.body;

        for (const key of ['name', 'content']) {
                if (!Object.prototype.hasOwnProperty.call(body, key)) {
                        return res[400](30001, `Field "${key}" is missing`);
                }

                const val = body[key];

                if (typeof val !== 'string' || !val.trim().length) {
                        return res[400](30001, `Field "${key}" is invalid`);
                }
        }

        const update = <types.Tag>{};

        update.editedAt = Date.now();
        update.content = (<string>body.content).trim();

        const filter = {
                guild: req.params.id,
                name: (<string>body.name).trim()
        };

        /* admin-only */
        if (req.session.isAdmin) {
                if (typeof body.newGuild === 'string') update.guild = body.newGuild;
                if (typeof body.newName === 'string') update.name = body.newName;
                if (typeof body.newAuthor === 'string') update.author = body.newAuthor;

                if (update.content === null) {
                        delete update.content;
                }
        }

        const result = await app.mongo.tags
                .findOneAndUpdate(filter, { $set: update }, { returnDocument: 'after' });

        if (!result.value) {
                return res[404](0, 'Unknown tag');
        }

        return res[200](result.value);
}
