"use strict";
const tagDataFields = ['name', 'content'];
module.exports = async function (app, req, res) {
    const data = {};
    for (const key of tagDataFields) {
        if (!Object.prototype.hasOwnProperty.call(req.body, key)) {
            return app.responses[400](res, 30001, `Field "${key}" is missing`);
        }
        if (typeof req.body[key] !== 'string' || !req.body[key].trim().length) {
            return app.responses[400](res, 30001, `Field "${key}" is invalid`);
        }
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            data[key] = req.body[key];
        }
    }
    data.guild = req.params.id;
    data.author = (req.session.isAdmin && req.body.author) || req.session.user.id;
    data.createdAt = Date.now();
    try {
        await app.models.Tag.create(data);
    }
    catch (err) {
        return app.responses[403](res, 11001, 'Tag already exists');
    }
    return app.responses[201](res, data);
};
//# sourceMappingURL=post.js.map