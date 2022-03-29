"use strict";
module.exports = async function (core, req, res) {
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
    if (req.body.prefixes !== undefined) {
        if (req.body.prefixes == null) {
            set('prefixes', core.config.prefixes.default);
        }
        else if (req.body.prefixes instanceof Array) {
            req.body.prefixes = req.body.prefixes
                .filter(p => typeof p === 'string' && p.length && p.length <= 12);
            set('prefixes', req.body.prefixes.length
                ? req.body.prefixes
                : core.config.prefixes.default);
        }
    }
    if (req.body.delCommands !== undefined) {
        set('delCommands', req.body.delCommands, 'boolean');
    }
    if (req.body.muteRole !== undefined) {
        set('muteRole', req.body.muteRole, 'string');
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
    if (req.body.noDisableWarning !== undefined) {
        set('noDisableWarning', req.body.noDisableWarning, 'boolean');
    }
    if (req.body.verboseHelp !== undefined) {
        set('verboseHelp', req.body.verboseHelp, 'boolean');
    }
    if (req.session.isAdmin) {
        for (const key of ['isIgnored', 'isPremium', 'hasPremium']) {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                set(key, req.body[key], 'boolean');
            }
        }
        if (req.body.client !== undefined) {
            set('client', req.body.client, 'string');
        }
        if (req.body.caseCount !== undefined) {
            set('caseCount', req.body.caseCount, 'number');
        }
    }
    if (!update) {
        return core.responses[400](res, 30001, 'Invalid request body');
    }
    try {
        var result = await core.models.Guild
            .findOneAndUpdate({ id: req.params.id }, update, { new: true })
            .lean()
            .exec();
        core.redis.publish('guildUpdate', req.params.id);
    }
    catch (err) {
        core.log(err, 'error', '/api/guilds.patch');
        return core.responses[500](res);
    }
    if (!result) {
        return core.responses[403](res, 10001, 'Unknown guild');
    }
    return core.responses[200](res, result);
};
//# sourceMappingURL=patch.js.map