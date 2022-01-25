module.exports = async function (server, req, res) {
        let update;

        if (typeof req.body.muteRole === 'string') {
                update = {};
                update.muteRole = req.body.muteRole;
        }

        if (req.body.prefixes instanceof Array) {
                const prefixes = req.body.prefixes.length
                        ? req.body.prefixes.filter(p => p.length && p.length <= 12)
                        : server.config.prefixes.default;

                if (prefixes.length && prefixes.length <= 15) {
                        update = update || {};
                        update.prefixes = prefixes;
                }
        }

        if (typeof req.body.delCommands === 'boolean') {
                update = update || {};
                update.delCommands = req.body.delCommands;
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

        if (update) {
                return server.updateGuild(req.params.id, { $set: update })
                        .then(() => server.response(204, res))
                        .catch(err => {
                                server.log(err, 'error');

                                return server.response(500, res)
                        });
        } else {
                return server.response(400, res, 30001, 'Invalid request body');
        }
}