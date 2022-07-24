import type * as express from 'express';
import type * as types from '@engel/types';
import type App from '../../../core/structures/App';

const tagDataFields = ['name', 'content'];

export = async function (app: App, req: express.Request, res: express.Response) {
        const data = <types.Tag>{};
        const body = req.body;

        for (const key of tagDataFields) {
                if (!Object.prototype.hasOwnProperty.call(body, key)) {
                        return app.responses[400](res, 30001, `Field "${key}" is missing`);
                }

                if (typeof body[key] !== 'string' || !(<string>body[key]).trim().length) {
                        return app.responses[400](res, 30001, `Field "${key}" is invalid`);
                }
        }

        data.name = <string>body.name;
        data.content = <string>body.content;
        data.guild = req.params.id;
        data.author = (req.session.isAdmin && <string>body.author) || req.session.user.id;
        data.createdAt = Date.now();

        try {
                await app.mongo.tags.insertOne(data);
        } catch (err) {
                if (err?.code === 11000) {
                        return app.responses[403](res, 11001, 'Tag already exists');
                }

                app.logger.get('api/tags.post').error(err);
                return app.responses[500](res);
        }

        return app.responses[201](res, data);
}
