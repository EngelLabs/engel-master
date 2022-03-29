"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const superagent = require("superagent");
const Base_1 = require("../structures/Base");
class Requests extends Base_1.default {
    async _request(token, path) {
        const resp = await superagent
            .get('https://discord.com/api/v9' + path)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .set('User-Agent', this.baseConfig.name);
        return resp.body;
    }
    async fetchUserData(req) {
        const token = req.session.token, config = this.config;
        if (config.apiToken && req.headers.authorization === config.apiToken) {
            req.session.user = await this._request(token, '/users/@me');
            return;
        }
        const [user, allGuilds] = await Promise.all([
            this._request(token, '/users/@me'),
            this._request(token, '/users/@me/guilds')
        ]);
        const guilds = allGuilds.filter(g => {
            if (g.owner) {
                return true;
            }
            const perms = BigInt(g.permissions);
            return (!!(perms & eris.Constants.Permissions.manageGuild)) ||
                (!!(perms & eris.Constants.Permissions.administrator));
        });
        const isAdmin = config.users.developers.includes(user.id);
        Object.assign(req.session, { user, guilds, allGuilds, isAdmin });
    }
    syncLocals(req, res) {
        if (!req.url.includes('api')) {
            Object.assign(res.locals, {
                user: JSON.stringify(req.session.user),
                guilds: JSON.stringify(req.session.guilds),
                allGuilds: JSON.stringify(req.session.allGuilds),
                isAdmin: JSON.stringify(req.session.isAdmin)
            });
        }
    }
}
exports.default = Requests;
//# sourceMappingURL=Requests.js.map