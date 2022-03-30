"use strict";
module.exports = async function (app, req, res) {
    const command = app.commands.get(req.body.name);
    if (!command)
        return app.responses[403](res, 10002, 'Unknown command');
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
        if (!command.isSubcommand) {
            set('disabled', req.body.disabled, 'boolean');
        }
        else if (req.body.disabled !== null) {
            set('disabled', req.body.disabled, 'boolean');
        }
    }
    if (!command.isSubcommand) {
        if (req.body.del !== undefined) {
            set('del', req.body.del, 'boolean');
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
    }
    if (!update) {
        return app.responses[400](res, 30001, 'Invalid response body');
    }
    if (!command.isSubcommand) {
        if (update.$set) {
            for (const key in update.$set) {
                update.$set[`commands.${command.name}.${key}`] = update.$set[key];
                delete update.$set[key];
            }
        }
        if (update.$unset) {
            for (const key in update.$unset) {
                update.$unset[`commands.${command.name}.${key}`] = update.$unset[key];
                delete update.$unset[key];
            }
        }
    }
    else {
        update.$set[`commands.${command.name}`] = update.$set.disabled;
        delete update.$set.disabled;
    }
    try {
        var result = await app.models.Guild
            .findOneAndUpdate({ id: req.params.id }, update, { new: true })
            .lean()
            .exec();
        app.redis.publish('guildUpdate', req.params.id);
    }
    catch (err) {
        app.log(err, 'error', 'api/commands.patch');
        return app.responses[500](res);
    }
    if (!result) {
        return app.responses[403](res, 10001, 'Unknown guild');
    }
    return app.responses[200](res, result.commands?.[command.name] || {});
};
//# sourceMappingURL=patch.js.map