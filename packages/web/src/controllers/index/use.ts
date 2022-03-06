import type * as express from 'express';
import type Core from '../../core/Core';

export = async function (core: Core, req: express.Request, res: express.Response, next: express.NextFunction) {
        res.locals = {
                config: core.config,
                scripts: ['/js/react/navbar.js'],
                stylesheets: ['/css/navbar.css']
        };

        if (core.config.apiToken && req.headers.authorization === core.config.apiToken) {
                req.session.token = 'Bot ' + core.baseConfig.client.token;
                req.session.isAdmin = true;
        }

        if (!req.session.token) {
                return next();
        }

        if (req.session.lastSync && (Date.now() - req.session.lastSync) < 1000) {
                core.requests.syncLocals(req, res);

                return next();
        }

        try {
                await core.requests.fetchUserData(req);
        } catch (err) {
                if (err && err.response) {
                        if (err.response.status === 401) {
                                req.session.destroy(err => {
                                        err && core.log('Error while destroying session: ' + err, 'error', '/index.use');
                                });

                                return res.redirect('/login');
                        }
                }

                core.log(err, 'error', '/index.use');

                return next();
        }

        req.session.lastSync = Date.now();
        core.requests.syncLocals(req, res);

        return next();
}
