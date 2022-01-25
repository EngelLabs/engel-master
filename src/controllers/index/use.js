module.exports = async function (server, req, res, next) {
        res.locals = {
                config: server.config,
                scripts: ['/js/react/navbar.js'],
                stylesheets: ['/css/navbar.css'],
        };

        if (!req.session.token) {
                return next();
        }

        if (req.session.lastSync && (Date.now() - req.session.lastSync) < 1000) {
                return next();
        }

        try {
                await server.fetchUserData(req, res);
        } catch (err) {
                if (err && err.response) {
                        if (err.response.status == 401) {
                                req.session.destroy(err => {
                                        err && this.log('Error while destroying session: ' + err, 'error', '/index.use');
                                });

                                return res.redirect('/login');
                        }
                }

                console.error(err);

                return next();
        }

        req.session.lastSync = Date.now();

        return next()
}