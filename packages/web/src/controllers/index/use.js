module.exports = async function (server, req, res, next) {
        res.locals = {
                config: server.config,
                scripts: ['/js/react/navbar.js'],
                stylesheets: ['/css/navbar.css'],
        };

        if (server.config.apiToken && req.headers.authorization === server.config.apiToken) {
                req.session.token = 'Bot ' + server.baseConfig.client.token;
                req.session.isAdmin = true;
        }

        if (!req.session.token) {
                return next();
        }

        if (req.session.lastSync && (Date.now() - req.session.lastSync) < 1000) {
                server.syncLocals(req, res);

                return next();
        }

        try {
                await server.fetchUserData(req);
        } catch (err) {
                if (err && err.response) {
                        if (err.response.status == 401) {
                                req.session.destroy(err => {
                                        err && server.log('Error while destroying session: ' + err, 'error', '/index.use');
                                });

                                return res.redirect('/login');
                        }
                }

                server.log(err, 'error', '/index.use');

                return next();
        }

        req.session.lastSync = Date.now();
        server.syncLocals(req, res);

        return next();
}