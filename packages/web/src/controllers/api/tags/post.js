const tagDataFields = ['name', 'content'];


module.exports = async function (server, req, res) {
        const data = {};
        
        for (const key of tagDataFields) {
                if (!req.body.hasOwnProperty(key)) {
                        return server.response(400, res, 30001, `Field "${key}" is missing`);
                }

                if (typeof req.body[key] !== 'string' || !req.body[key].length) {
                        return server.response(400, res, 30001, `Field "${key}" is invalid`);
                }

                data[key] = req.body[key];
        }

        data.guild = req.params.id;
        data.author = (req.session.isAdmin && req.body.author) || req.session.user.id;
        data.createdAt = Date.now();

        try {
                await server.collection('tags').insertOne(data);
        } catch (err) {
                return server.response(403, res, 11001, 'Tag already exists');
        }

        return server.response(201, res, data);
}