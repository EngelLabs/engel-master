module.exports = async function (server, req, res) {
        const guild = await server
                .collection('guilds')
                .findOne({ id: req.params.id });

        return guild
                ? server.response(200, res, guild)
                : server.response(404, res, 10001);
}