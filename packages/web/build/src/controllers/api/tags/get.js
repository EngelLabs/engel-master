"use strict";
module.exports = async function (app, req, res) {
    const filter = { guild: req.params.id };
    const tags = await app.models.Tag
        .find(filter)
        .lean()
        .exec();
    return app.responses[200](res, tags);
};
//# sourceMappingURL=get.js.map