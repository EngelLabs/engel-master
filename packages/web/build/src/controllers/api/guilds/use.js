"use strict";
module.exports = async function (app, req, res, next) {
    if (!req.session.token) {
        return app.responses[401](res, 20001);
    }
    if (req.session.isAdmin) {
        return next();
    }
    const guildID = req.params.id;
    const guild = req.session.guilds.find(g => g.id === guildID);
    if (!guild) {
        return app.responses[403](res, 10001, 'Unknown guild');
    }
    return next();
};
//# sourceMappingURL=use.js.map