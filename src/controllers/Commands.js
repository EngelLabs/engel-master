const Controller = require('../core/structures/Controller');


class Commands extends Controller {
    constructor() {
        super();

        return [
            {
                uri: '/api/guilds/:id/commands/:name/updateSettings',
                patch: this.patch.bind(this),
            }
        ];
    }

    patch(req, res) {
        if (!req.params.id) return this.badRequest(res);
        if (!req.params.name) return this.badRequest(res, 1, 'Missing command name.');
        if (!req.body) return this.badRequest(res, 2, 'Missing request body.');

        const command = this.commands.get(req.params.name);

        if (!command) return this.badRequest(res, 3, 'Invalid command.');

        let update;

        if (typeof req.body.enabled === 'boolean') {
            update = {};
            update.enabled = req.body.enabled;
        }
        if (!command.isSubcommand) {
            if (typeof req.body.delCommand === 'boolean') {
                update = update || {};
                update.delCommand = req.body.delCommand;
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

        if (typeof update === 'undefined') return this.badRequest(res, 5, 'Invalid request body.');

        if (!command.isSubcommand) {
            for (const key in update) {
                update[`commands.${command.dbName}.${key}`] = update[key];
                delete update[key];
            }
        } else {
            update[`commands.${command.dbName}`] = update.enabled;
            delete update.enabled;
        }

        return this.updateGuild(req.params.id, { $set: update })
            .then(() => this.empty(res))
            .catch(err => this.internalServerError(res, null, err));
    }
}


module.exports = Commands;