module.exports = async function (server, req, res, next) {
        if (!req.session.user) return server.response(401, res, 20001);

        const guildID = req.params.id;

        let guild = req.session.guilds.find(g => g.id === guildID);

        if (!guild && req.session.isAdmin) {
                try {
                        guild = await server.eris.getRESTGuild(guildID);
                } catch { }
        }

        if (!guild) return server.response(403, res, 10001, 'Unknown guild');

        return next();
}