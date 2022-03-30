"use strict";
module.exports = async function (app, req, res) {
    const filter = { guild: req.params.id, author: req.session.user.id };
    if (typeof req.body.author === 'string') {
        filter.author = req.body.author;
    }
    if (req.body.tags instanceof Array && req.body.tags.length) {
        const tags = req.body.tags.filter(o => typeof o === 'string' && o.length);
        if (!tags.length) {
            return app.responses[400](res, 30001, 'Invalid tag names');
        }
        filter.name = { $in: tags };
    }
    await app.models.Tag.deleteMany(filter);
    return app.responses[204](res);
};
//# sourceMappingURL=delete.js.map