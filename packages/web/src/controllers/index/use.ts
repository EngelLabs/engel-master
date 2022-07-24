import type * as express from 'express';
import type App from '../../core/structures/App';

export = async function (app: App, req: express.Request, res: express.Response, next: express.NextFunction) {
        res.locals = {
                config: app.config,
                scripts: ['/js/react/navbar.js'],
                stylesheets: ['/css/navbar.css']
        };

        if (app.config.apiToken && req.headers.authorization === app.config.apiToken) {
                req.session.token = 'Bot ' + app.baseConfig.client.token;
                req.session.isAdmin = true;
        }

        if (!req.session.token) {
                return next();
        }

        if (req.session.lastSync && (Date.now() - req.session.lastSync) < 1000) {
                app.requests.syncLocals(req, res);

                return next();
        }

        try {
                await app.requests.fetchUserData(req);
        } catch (err) {
                if (err && err.response) {
                        if (err.response.status === 401) {
                                req.session.destroy(err => {
                                        err && app.logger.get('/index.use').error('Error while destroying session: ' + err);
                                });

                                return res.redirect('/login');
                        }
                }

                app.logger.get('/index.use').error(err);

                return next();
        }

        app.requests.syncLocals(req, res);

        return next();
}
