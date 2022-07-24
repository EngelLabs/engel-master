import * as eris from 'eris';
import * as superagent from 'superagent';
import type * as express from 'express';
import type * as types from '@engel/types';
import Base from '../structures/Base';

export default class Requests extends Base {
        private async _request(token: string, path: string) {
                const resp = await superagent
                        .get('https://discord.com/api/v9' + path)
                        .set('Accept', 'application/json')
                        .set('Authorization', token)
                        .set('User-Agent', this.baseConfig.name);

                return resp.body;
        }

        public async fetchUserData(req: express.Request) {
                const token = req.session.token,
                        config = this.config;

                if (config.apiToken && req.headers.authorization === config.apiToken) {
                        req.session.user = await this._request(token, '/users/@me');

                        return;
                }

                const [user, allGuilds] = await Promise.all([
                        this._request(token, '/users/@me'),
                        this._request(token, '/users/@me/guilds')
                ]);

                const guilds = (<types.DiscordGuild[]>allGuilds).filter(g => {
                        if (g.owner) {
                                return true;
                        }

                        const perms = BigInt(g.permissions);

                        return (!!(perms & eris.Constants.Permissions.manageGuild)) ||
                                (!!(perms & eris.Constants.Permissions.administrator));
                });

                const isAdmin = config.users.developers.includes(user.id);

                Object.assign(req.session, { user, guilds, allGuilds, isAdmin });
                req.session.lastSync = Date.now();
        }

        public syncLocals(req: express.Request, res: express.Response) {
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
