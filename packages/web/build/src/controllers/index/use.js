"use strict";
module.exports = async function (app, req, res, next) {
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
    }
    catch (err) {
        if (err && err.response) {
            if (err.response.status === 401) {
                req.session.destroy(err => {
                    err && app.log('Error while destroying session: ' + err, 'error', '/index.use');
                });
                return res.redirect('/login');
            }
        }
        app.log(err, 'error', '/index.use');
        return next();
    }
    req.session.lastSync = Date.now();
    app.requests.syncLocals(req, res);
    return next();
};
//# sourceMappingURL=use.js.map