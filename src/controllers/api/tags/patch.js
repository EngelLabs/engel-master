const fields = ['name', 'content'];


module.exports = async function (server, req, res) {
        for (const key of fields) {
                if (!req.body.hasOwnProperty(key)) {
                        return server.response(400, res, 30001, `Field "${key}" is missing`)
                }

                const val = req.body[key];

                if (typeof val !== 'string' || !val.length) {
                        return server.response(400, res, 30001, `Field "${key}" is invalid`);
                }
        }

        const update = {};
        
        update.editedAt = Date.now();
        update.content = req.body.content;

        const filter = {
                guild: req.params.id,
                name: req.body.name,
                author: req.session.user.id,
        };

        if (req.session.isAdmin) {
                if (req.body.author !== undefined) filter.author = req.body.author || filter.author;
                if (req.body.newGuild !== undefined) update.guild = req.body.newGuild;
                if (req.body.newName !== undefined) update.name = req.body.newName;
                if (req.body.newAuthor !== undefined) update.author = req.body.newAuthor;
        
                if (update.content === '_same') {
                        delete update.content;
                }
        }

        const result = await server.collection('tags').findOneAndUpdate(filter, { $set: update }, { returnDocument: 'after' });

        if (!result.value) {
                return server.response(404, res, 0, 'Unknown tag');
        }

        return server.response(200, res, result.value);
}