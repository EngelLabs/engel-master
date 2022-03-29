"use strict";
module.exports = async function (core, req, res, next) {
    if (!req.session.token) {
        return core.responses[401](res, 20001);
    }
    if (req.session.isAdmin) {
        return next();
    }
    const guildID = req.params.id;
    const guild = req.session.guilds.find(g => g.id === guildID);
    if (!guild) {
        return core.responses[403](res, 10001, 'Unknown guild');
    }
    return next();
};
//# sourceMappingURL=use.js.map