"use strict";
module.exports = async function (core, req, res) {
    const filter = { guild: req.params.id };
    const tags = await core.models.Tag
        .find(filter)
        .lean()
        .exec();
    return core.responses[200](res, tags);
};
//# sourceMappingURL=get.js.map