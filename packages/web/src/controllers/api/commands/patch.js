module.exports = async function (server, req, res) {
        const command = server.commands.get(req.body.name);

        if (!command) return server.response(403, res, 10002, 'Unknown command');

        let update;

        const set = (condition, k, v) => {
                if (!condition) return;

                update = update || {};

                if (command.isSubcommand) {
                        update = v;
                } else {
                        update = update || {};
                        update[`commands.${command.name}.${k}`] = v;
                }
        }

        set(typeof req.body.disabled === 'boolean', 'disabled', req.body.disabled);

        if (!command.isSubcommand) {
                set(typeof req.body.del === 'boolean', 'del', req.body.del);

                set(req.body.allowedRoles instanceof Array, 'allowedRoles', req.body.allowedRoles);

                set(req.body.ignoredRoles instanceof Array, 'ignoredRoles', req.body.ignoredRoles);
                
                set(req.body.allowedChannels instanceof Array, 'allowedChannels', req.body.allowedChannels);

                set(req.body.ignoredChannels instanceof Array, 'ignoredChannels', req.body.ignoredChannels);
        }

        if (!update === undefined) {
                return server.response(400, res, 30001, 'Invalid response body');
        }

        let result;

        try {
                result = await server.collection('guilds')
                        .findOneAndUpdate({ id: req.params.id }, { $set: update }, { returnDocument: 'after' })

                server.redis.publish('guildUpdate', req.params.id);
        } catch (err) {
                server.log(err, 'error', 'api/commands.patch');

                return server.response(500, res);
        }

        if (!result.value) {
                return server.response(403, res, 10001, 'Unknown guild');
        }

        return server.response(200, res, result.value.commands?.[command.name]);
}