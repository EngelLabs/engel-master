"use strict";
module.exports = async function (app, req, res) {
    const guild = await app.models.Guild
        .findOne({ id: req.params.id })
        .lean()
        .exec();
    return guild
        ? app.responses[200](res, guild)
        : app.responses[404](res, 10001);
};
//# sourceMappingURL=get.js.map