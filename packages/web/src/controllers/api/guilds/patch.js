module.exports = async function (server, req, res) {
        let update;

        const set = (condition, k, v) => {
                if (!condition) return;

                update = update || {};
                update[k] = v;
        }

        if (req.body.prefixes instanceof Array) {
                const prefixes = req.body.prefixes.length
                        ? req.body.prefixes.filter(p => p.length && p.length <= 12)
                        : server.config.prefixes.default;

                set(prefixes.length && prefixes.length <= 15, 'prefixes', prefixes);
        }

        set(typeof req.body.delCommands === 'boolean', 'delCommands', req.body.delCommands);

        set(typeof req.body.muteRole === 'string', 'muteRole', req.body.muteRole);

        set(req.body.allowedRoles instanceof Array, 'allowedRoles', req.body.allowedRoles);

        set(req.body.ignoredRoles instanceof Array, 'ignoredRoles', req.body.ignoredRoles);

        set(req.body.allowedChannels instanceof Array, 'allowedChannels', req.body.allowedChannels);

        set(req.body.ignoredChannels instanceof Array, 'ignoredChannels', req.body.ignoredChannels);

        if (!update) {
                return server.response(400, res, 30001, 'Invalid request body');
        }

        let result;

        try {
                result = await server.collection('guilds')
                        .findOneAndUpdate({ id: req.params.id }, { $set: update }, { returnDocument: 'after' });

                server.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                server.log(err, 'error', '/api/guilds.patch');

                return server.response(500, res);
        }

        if (!result.value) {
                return server.response(403, res, 10001, 'Unknown guild');
        }

        return server.response(200, res, result.value);
}