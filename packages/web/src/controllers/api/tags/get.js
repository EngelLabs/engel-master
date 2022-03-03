module.exports = async function (server, req, res) {
        const filter = { guild: req.params.id };

        const tags = await server.collection('tags').find(filter).toArray();

        return server.response(200, res, tags);
}