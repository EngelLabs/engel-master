import type * as express from 'express';
import type * as types from '@engel/types';
import type App from '../../../core/structures/App';

const tagDataFields = ['name', 'content'];

export = async function (app: App, req: express.Request, res: express.Response) {
        const data = <types.Tag | any>{};

        for (const key of tagDataFields) {
                if (!Object.prototype.hasOwnProperty.call(req.body, key)) {
                        return app.responses[400](res, 30001, `Field "${key}" is missing`);
                }

                if (typeof req.body[key] !== 'string' || !(<string>req.body[key]).trim().length) {
                        return app.responses[400](res, 30001, `Field "${key}" is invalid`);
                }

                if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                        data[<keyof types.Tag>key] = req.body[key];
                }
        }

        data.guild = req.params.id;
        data.author = (req.session.isAdmin && req.body.author) || req.session.user.id;
        data.createdAt = Date.now();

        try {
                await app.models.Tag.create(data);
        } catch (err) {
                return app.responses[403](res, 11001, 'Tag already exists');
        }

        return app.responses[201](res, data);
}
