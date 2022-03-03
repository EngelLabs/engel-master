module.exports = async function (server, req, res, next) {
        if (!req.session.token) {
                return server.response(401, res, 20001);
        }

        if (req.session.isAdmin) {
                return next();
        }

        const guildID = req.params.id;

        const guild = req.session.guilds.find(g => g.id === guildID);

        if (!guild) {
                return server.response(403, res, 10001, 'Unknown guild');
        }

        return next();
}