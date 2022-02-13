module.exports = async function (server, req, res) {
        const module = server.modules.get(req.body.name);

        if (!module) return server.response(403, res, 10002, 'Unknown module');

        let update;

        const set = (condition, k, v) => {
                if (!condition) return;

                update = update || {};
                update[`${module.dbName}.${k}`] = v;
        }

        set(typeof req.body.delCommands === 'boolean', 'delCommands', req.body.delCommands);

        set(typeof req.body.noDisableWarning === 'boolean', 'noDisableWarning', req.body.noDisableWarning);

        set(req.body.allowedRoles instanceof Array, 'allowedRoles', req.body.allowedRoles);

        set(req.body.ignoredRoles instanceof Array, 'ignoredRoles', req.body.ignoredRoles);

        set(req.body.allowedChannels instanceof Array, 'allowedChannels', req.body.allowedChannels);

        set(req.body.ignoredChannels instanceof Array, 'ignoredChannels', req.body.ignoredChannels);

        switch (module.dbName) {
                case 'mod':
                        if (typeof req.body.responses === 'object') {
                                const guildConfig = await server.collection('guilds').findOne({ id: req.params.id });

                                if (!guildConfig || !guildConfig.isPremium) {
                                        break;
                                }

                                const customResponseKeys = [
                                        'ban',
                                        'block',
                                        'kick',
                                        'lock',
                                        'mute',
                                        'unban',
                                        'unblock',
                                        'unlock',
                                        'unmute',
                                        'warn',
                                ];

                                for (const key in req.body.responses) {
                                        const val = req.body.responses[key];

                                        if (customResponseKeys.includes(key) && typeof val === 'string') {
                                                update = update || {};
                                                update.mod = update.mod || {};
                                                update.mod.responses = update.mod.responses || {};
                                                update.mod.responses[key] = val;
                                        }
                                }
                        }
        }

        console.log(update);

        if (!update) {
                return server.response(400, res, 30001, 'Invalid response body');
        }

        let result;

        try {
                result = await server.collection('guilds')
                        .findOneAndUpdate({ id: req.params.id }, { $set: update }, { returnDocument: 'after' })

                server.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                server.log(err, 'error', 'api/modules.patch');

                return server.response(500, res);
        }

        if (!result.value) {
                return server.response(403, res, 10001, 'Unknown guild');
        }

        return server.response(200, res, result.value?.[module.dbName]);
}