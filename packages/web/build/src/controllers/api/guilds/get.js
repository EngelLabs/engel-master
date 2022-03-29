"use strict";
module.exports = async function (core, req, res) {
    const guild = await core.models.Guild
        .findOne({ id: req.params.id })
        .lean()
        .exec();
    return guild
        ? core.responses[200](res, guild)
        : core.responses[404](res, 10001);
};
//# sourceMappingURL=get.js.map