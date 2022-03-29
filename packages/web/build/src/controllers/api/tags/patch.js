"use strict";
const fields = ['name', 'content'];
module.exports = async function (core, req, res) {
    for (const key of fields) {
        if (!Object.prototype.hasOwnProperty.call(req.body, key)) {
            return core.responses[400](res, 30001, `Field "${key}" is missing`);
        }
        const val = req.body[key];
        if (typeof val !== 'string' || !val.trim().length) {
            return core.responses[400](res, 30001, `Field "${key}" is invalid`);
        }
    }
    const update = {};
    update.editedAt = Date.now();
    update.content = req.body.content;
    const filter = {
        guild: req.params.id,
        name: req.body.name
    };
    if (req.session.isAdmin) {
        if (typeof req.body.newGuild === 'string')
            update.guild = req.body.newGuild;
        if (typeof req.body.newName === 'string')
            update.name = req.body.newName;
        if (typeof req.body.newAuthor === 'string')
            update.author = req.body.newAuthor;
        if (update.content === null) {
            delete update.content;
        }
    }
    const result = await core.models.Tag
        .findOneAndUpdate(filter, { $set: update }, { new: true })
        .lean()
        .exec();
    if (!result) {
        return core.responses[404](res, 0, 'Unknown tag');
    }
    return core.responses[200](res, result);
};
//# sourceMappingURL=patch.js.map