const Controller = require('../core/structures/Controller');


class Modules extends Controller {
    constructor() {
        super();

        const baseUri = '/api/guilds/:id/modules';

        return [
            {
                uri: baseUri + '/mod',
                patch: this.patchModerator.bind(this),
            },
        ];
    }

    async patch(req, res) {
        if (!req.params.id) return this.badRequest(res, 0, 'Missing guild ID.');
        if (!req.params.name) return this.badRequest(res, 1, 'Missing module name.');
        if (!req.body) return this.badRequest(res, 2, 'Missing request body.');

        const module = this.modules.get(req.params.name);

        if (!module) return this.badRequest(res, 3, 'Invalid module.');

        let update;

        if (typeof req.body.enabled === 'boolean') {
            update = {};
            update.enabled = req.body.enabled;
        }
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

        if (!update) return this.badRequest(res, 4, 'Invalid request body.');

        for (const key in update) {
            update[`modules.${module.dbName}.${key}`] = update[key];
            delete update[key];
        }

        return this.updateGuild(req.params.id, { $set: update })
            .then(() => this.empty(res))
            .catch(err => this.internalServerError(res, null, err));
    }

    patchModerator(req, res) { }
}


module.exports = Modules;