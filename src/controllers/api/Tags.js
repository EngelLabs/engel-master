const Controller = require('../../structures/Controller');

const tagDataFields = ['name', 'content', 'author'];
const tagUpdateFields = ['name', 'content'];


class Tags extends Controller {
    constructor() {
        super();

        return [
            {
                uri: '/api/guilds/:id/tags',
                delete: this.delete.bind(this),
                get: this.get.bind(this),
                patch: this.patch.bind(this),
                post: this.post.bind(this),
            },
        ];
    }

    async get(req, res) {
        const filter = { guild: req.params.id };

        if (req.body.author) filter.author = req.body.author;

        const tags = await this.collection('tags').find(filter).toArray();

        return this.success(res, tags);
    }

    async delete(req, res) {
        const filter = { guild: req.params.id };

        if (req.body.author) filter.author = req.body.author;
        if (req.body.tags instanceof Array && req.body.tags.length) {
            filter.name = { $in: req.body.tags };
        }

        const result = await this.collection('tags').deleteMany(filter);

        return this.success(res, result.deletedCount);
    }

    async post(req, res) {
        if (!req.body) return this.badRequest(res, 0, 'Missing request body.');

        const data = {};

        for (const key of tagDataFields) {
            if (typeof req.body[key] === 'undefined') return this.badRequest(res, 1, `Field "${key}" is missing.`);
            if (typeof req.body[key] !== 'string' || !req.body[key]) return this.badRequest(res, 2, `Field "${key}" is invalid.`);

            data[key] = req.body[key];
        }

        if (!data.name && !data.content) return this.badRequest(res, 3);

        data.guild = req.params.id;

        try {
            await this.collection('tags').insertOne(data);
        } catch (err) {
            return this.forbidden(res, 0, 'Tag already exists.');
        }

        return this.created(res, data);
    }

    async patch(req, res) {
        if (!req.body) return this.badRequest(res, 0, 'Missing request body.');

        const data = {};

        for (const key of tagUpdateFields) {
            if (typeof req.body[key] !== 'undefined') data[key] = req.body[key];

            if (typeof data[key] !== 'string' || !data[key]) return this.badRequest(res, 1, `Field "${key}" is invalid.`);
        }

        const filter = { guild: req.params.id, name: req.params.name };

        if (req.body.author) filter.author = req.body.author;

        result = await this.collection('tags').updateOne(filter, data);

        if (!result.matchedCount) return this.notFound(res, 0, 'Tag not found.');

        return this.empty(res);
    }
}


module.exports = Tags;