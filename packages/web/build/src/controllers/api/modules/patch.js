"use strict";
module.exports = async function (app, req, res) {
    const module = app.modules.get(req.body.name);
    if (!module)
        return app.responses[403](res, 10002, 'Unknown module');
    let update;
    function set(key, value, type) {
        if (value === null) {
            update = update || {};
            update.$unset = update.$unset || {};
            update.$unset[key] = null;
        }
        else {
            if (type !== undefined && typeof value !== type) {
                return;
            }
            update = update || {};
            update.$set = update.$set || {};
            update.$set[key] = value;
        }
    }
    if (req.body.disabled !== undefined) {
        set('disabled', req.body.disabled, 'boolean');
    }
    if (req.body.delCommands !== undefined) {
        set('delCommands', req.body.delCommands, 'boolean');
    }
    for (const key of ['allowedRoles', 'ignoredRoles', 'allowedChannels', 'ignoredChannels']) {
        if (Object.prototype.hasOwnProperty.call(req.body, key)) {
            if (req.body[key] instanceof Array) {
                set(key, req.body[key].filter(o => typeof o === 'string' && o.length));
            }
            else if (req.body[key] === null) {
                set(key, null);
            }
        }
    }
    if (!update) {
        return app.responses[400](res, 30001, 'Invalid response body');
    }
    if (update.$set) {
        for (const key in update.$set) {
            update.$set[`modules.${module.dbName}.${key}`] = update.$set[key];
            delete update.$set[key];
        }
    }
    if (update.$unset) {
        for (const key in update.$unset) {
            update.$unset[`modules.${module.dbName}.${key}`] = update.$unset[key];
            delete update.$unset[key];
        }
    }
    try {
        var result = await app.models.Guild
            .findOneAndUpdate({ id: req.params.id }, update, { new: true })
            .lean()
            .exec();
        app.redis.publish('guildUpdate', req.params.id);
    }
    catch (err) {
        app.log(err, 'error', 'api/modules.patch');
        return app.responses[500](res);
    }
    if (!result) {
        return app.responses[403](res, 10001, 'Unknown guild');
    }
    return app.responses[200](res, result.modules?.[module.dbName] || {});
};
//# sourceMappingURL=patch.js.map