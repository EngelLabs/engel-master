module.exports = async function (server, req, res) {
        const filter = { guild: req.params.id, author: req.session.user.id };

        if (typeof req.body.author === 'string') {
                filter.author = req.body.author;
        }
        
        if (req.body.tags instanceof Array && req.body.tags.length) {
                const tags = req.body.tags.filter(o => typeof o === 'string' && o.length);

                if (!tags.length) {
                        return server.response(400, res, 30001, 'Invalid tag names');
                }

                filter.name = { $in: tags };
        }

        await server.collection('tags').deleteMany(filter);

        return server.response(204, res);
}