"use strict";
const tagDataFields = ['name', 'content'];
module.exports = async function (core, req, res) {
    const data = {};
    for (const key of tagDataFields) {
        if (!Object.prototype.hasOwnProperty.call(req.body, key)) {
            return core.responses[400](res, 30001, `Field "${key}" is missing`);
        }
        if (typeof req.body[key] !== 'string' || !req.body[key].trim().length) {
            return core.responses[400](res, 30001, `Field "${key}" is invalid`);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            data[key] = req.body[key];
        }
    }
    data.guild = req.params.id;
    data.author = (req.session.isAdmin && req.body.author) || req.session.user.id;
    data.createdAt = Date.now();
    try {
        await core.models.Tag.create(data);
    }
    catch (err) {
        return core.responses[403](res, 11001, 'Tag already exists');
    }
    return core.responses[201](res, data);
};
//# sourceMappingURL=post.js.map