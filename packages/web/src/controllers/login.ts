import * as superagent from 'superagent';
import Controller from '../core/structures/Controller';

export default new Controller('/login')
        .get(async (app, req, res) => {
                if (req.session.token) {
                        return res.redirect('/');
                }

                const staticConfig = app.staticConfig;

                let redirectUri = staticConfig.dev
                        ? `http://localhost:${staticConfig.site.port}/login`
                        : staticConfig.site.port
                                ? `https://${staticConfig.site.host}:${staticConfig.site.port}/login`
                                : `https://${staticConfig.site.host}/login`;

                if (req.query && req.query.code) {
                        const client = app.staticConfig.client;

                        const data = {
                                client_id: client.id,
                                client_secret: client.secret,
                                grant_type: 'authorization_code',
                                code: req.query.code,
                                redirect_uri: redirectUri
                        };

                        // if (req.query.state) {
                        //         params.state = req.query.state;
                        // }

                        try {
                                var resp = await superagent
                                        .post('https://discord.com/api/v9/oauth2/token')
                                        .set('Accept', 'application/json')
                                        .set('Content-Type', 'application/x-www-form-urlencoded')
                                        .set('User-Agent', staticConfig.name)
                                        .send(data);
                        } catch {
                                return res.redirect('/login');
                        }

                        req.session.token = 'Bearer ' + resp.body.access_token;

                        await app.requests.fetchUserData(req);
                        app.requests.syncLocals(req, res);

                        app.logger.get('/login.get').debug(`Authorized ${req.session.user.id}.`);

                        return res.redirect('/');
                }

                redirectUri = encodeURIComponent(redirectUri);

                const baseUrl = 'https://discord.com/api/v9';
                const _url = baseUrl +
                        `/oauth2/authorize?response_type=code&client_id=${app.staticConfig.client.id}` +
                        `&scope=guilds%20guilds.join%20identify&redirect_uri=${redirectUri}&prompt=consent`;

                return res.redirect(_url);
        });
