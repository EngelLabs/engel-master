
'use strict';

const Controller = require('../core/structures/Controller');


class Guilds extends Controller {
    constructor() {
        super();

        return [
            {
                uri: ['/api/guilds/:id', '/api/guilds/:id/'],
                use: this.middleware.bind(this),
                get: this.get.bind(this),
                patch: this.patch.bind(this),
            },
        ]
    }

    async middleware(req, res, next) {
        if (!req.session.token) return this.unauthorized(res, 0, 'Unauthorized');

        let guild = req.session.guilds.find(g => g.id === req.params.id);

        if (!guild && req.session.isAdmin) {
            try {
                guild = await this.eris.getRESTGuild(req.params.id);
            } catch {
                return this.notFound(res, null, 'Guild not found.');
            }
        }

        if (!guild) return this.unauthorized(res, 1, 'Unauthorized');

        return next();
    }

    async get(req, res) {
        if (!req.params.id) return this.badRequest(res);

        const guild = await this.collection('guilds').findOne({ id: req.params.id });

        return guild
            ? this.success(res, guild)
            : this.notFound(res, null, 'Guild not found.');
    }

    async patch(req, res) {
        if (!req.params.id) return this.badRequest(res);
        if (!req.body) return this.badRequest(res, 1, 'Missing request body.');

        let update;

        if (typeof req.body.muteRole === 'string') {
            update = {};
            update.muteRole = req.body.muteRole;
        }
        if (req.body.prefixes instanceof Array) {
            const prefixes = req.body.prefixes.length
                ? req.body.prefixes.filter(p => p.length && p.length <= 12)
                : this.config.prefixes.default;
            
            if (prefixes.length && prefixes.length <= 15) {
                update = update || {};
                update.prefixes = prefixes;
            }
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

        if (update) {
            return this.updateGuild(req.params.id, { $set: update })
                .then(() => this.empty(res))
                .catch(err => this.internalServerError(res, null, err));
        } else {
            return this.badRequest(res, 2, 'Invalid request body.');
        }
    }
}


module.exports = Guilds;