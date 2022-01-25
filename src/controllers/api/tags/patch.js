const tagUpdateFields = ['name', 'content'];


module.exports = async function (server, req, res) {
        const data = {};

        for (const key of tagUpdateFields) {
                if (req.body.hasOwnProperty(key)) {
                        data[key] = req.body[key];
                }

                if (typeof data[key] !== 'string' || !data[key].length) {
                        return server.response(400, res, 30001, `Field "${key}" is invalid`);
                }
        }

        const filter = {
                guild: req.params.id,
                name: req.body.name,
                author: req.session.user.id,
        };

        // if (req.body.author) filter.author = req.body.author;

        result = await server.collection('tags').updateOne(filter, { $set: data });

        if (!result.matchedCount) {
                return server.response(404, res, 0, 'Unknown tag');
        }

        const tag = await server.collection('tags').findOne(filter);

        return server.response(200, res, tag);
}