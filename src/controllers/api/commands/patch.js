module.exports = function (server, req, res) {
        const command = server.commands.get(req.params.name);

        if (!command) return server.response(403, res, 10002, 'Unknown command');

        let update;

        if (typeof req.body.enabled === 'boolean') {
                update = {};
                update.enabled = req.body.enabled;
        }

        if (!command.isSubcommand) {
                if (typeof req.body.delAfterUse === 'boolean') {
                        update = update || {};
                        update.delAfterUse = req.body.delAfterUse;
                }

                if (req.body.allowedRoles instanceof Array) {
                        update = update || {};
                        update.allowedRoles = req.body.allowedRoles;
                }

                if (req.body.ignoredRoles instanceof Array) {
                        update = update || {};
                        update.ignoredRoles = req.body.ignoredRoles;
                }

                if (req.body.allowedChannels instanceof Array) {
                        update = update || {};
                        update.allowedChannels = req.body.allowedChannels;
                }

                if (req.body.ignoredChannels instanceof Array) {
                        update = update || {};
                        update.ignoredChannels = req.body.ignoredChannels;
                }
        }

        if (!update) {
                return server.response(400, res, 30001, 'Invalid response body');
        }

        if (!command.isSubcommand) {
                for (const key in update) {
                        update[`commands.${command.dbName}.${key}`] = update[key];

                        delete update[key];
                }
        } else {
                update[`commands.${command.dbName}`] = update.enabled;

                delete update.enabled;
        }

        return server.updateGuild(req.params.id, { $set: update })
                .then(() => server.response(204, res))
                .catch(err => {
                        server.log(err, 'error', '/api/commands.patch');

                        return server.response(500, res);
                });
}