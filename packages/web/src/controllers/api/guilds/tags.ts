import type * as types from '@engel/types';
import Controller from '../../../core/structures/Controller';

export default new Controller('/api/guilds/:id/tags')
        .delete(async (app, req, res) => {
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
        })
        .get(async (app, req, res) => {
                const filter = { guild: req.params.id };

                const tags = await app.mongo.tags.find(filter).toArray();

                return res[200](tags);
        })
        .patch(async (app, req, res) => {
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
        })
        .post(async (app, req, res) => {
                const data = <types.Tag>{};
                const body = req.body;

                for (const key of ['name', 'content']) {
                        if (!Object.prototype.hasOwnProperty.call(body, key)) {
                                return res[400](30001, `Field "${key}" is missing`);
                        }

                        if (typeof body[key] !== 'string' || !(<string>body[key]).trim().length) {
                                return res[400](30001, `Field "${key}" is invalid`);
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
                                return res[403](11001, 'Tag already exists');
                        }

                        app.logger.get('api/tags.post').error(err);
                        return res[500]();
                }

                return res[201](data);
        });
